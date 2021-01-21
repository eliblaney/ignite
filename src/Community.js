import React from "react";
import {
  RefreshControl,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Share,
} from "react-native";
import {
  Avatar,
  Button,
  ButtonGroup,
  ListItem,
  Overlay,
  Tooltip,
} from "react-native-elements";
import DatePicker from "react-native-datepicker";
import AwesomeAlert from "react-native-awesome-alerts";
import IgniteHelper from "./IgniteHelper";
import Colors from "./Colors";
import LoadingScreen from "./LoadingScreen";
import UserList from "./UserList";
import PostList from "./PostList";
import Header from "./Header";
import ashWednesdays from "../config/AshWednesdays";

export default class Community extends React.Component {
  constructor(props) {
    super(props);

    this.today = new Date();
    this.today.setHours(0);
    this.today.setMinutes(0);
    this.today.setSeconds(0);
    this.today.setMilliseconds(0);

    this.state = {
      pickDate: false,
      isWriting: false,
      cancelWriting: false,
      writePostPrivacy: 1,
      ashWednesday: "...",
      chosenStartDate: null,
      postDetailComponent: null,
      postDetailComponentCache: null,
      error: null,
      refreshing: false,
      refreshPosts: false,
      refreshUsers: false,
    };
  }

  async componentDidMount() {
    const {community, uid, startedAt, currentDay} = this.props;

    const c = await IgniteHelper.api(
      "community",
      `action=geti&id=${community}`
    );
    const users = await this.getUsers(c);

    // Because the creator of the community is the first member...
    const isOwner = users[0].uid === uid;
    let joinComponent;
    if (
      !startedAt &&
      c.joincode !== undefined &&
      c.joincode !== null &&
      c.joincode.length > 0
    ) {
      const joincode = c.joincode.toUpperCase();
      joinComponent = (
        <View style={styles.joincodeView}>
          <Text style={styles.joincodeTitle}>Your join code is:</Text>
          <Text
            onPress={() =>
              Share.share({
                // now that's what I call spreading the holy fire of Big J
                message: `🔥 Join my Ignite community!\n🔥 Here's the code: ${joincode}`,
              })
            }
            style={styles.joincodeText}
          >
            {joincode}
          </Text>
          <Text style={styles.joincodeDesc}>
            This code is used to let others join your community!
          </Text>
        </View>
      );
    }
    let postButton;
    if (startedAt === false) {
      postButton = (
        <Tooltip
          backgroundColor={Colors.tertiary}
          popover={
            <Text style={{color: Colors.primaryText}}>
              You can post when the retreat starts!
            </Text>
          }
          withOverlay={false}
          width={275}
        >
          <Button
            disabled
            title="Write Post"
            type="solid"
            style={{width: "100%"}}
          />
        </Tooltip>
      );
    } else {
      postButton = (
        <Button
          title="Write Post"
          type="solid"
          onPress={() => this.setState({isWriting: true})}
          style={{width: "100%"}}
        />
      );
    }

    // get next ash wednesday date
    let nextAshWednesday = "";
    if (!currentDay) {
      for (let i = 0; i < ashWednesdays.length; i++) {
        const aw = ashWednesdays[i];
        const daw = Date.parse(aw);
        if (Date.now() < daw) {
          nextAshWednesday = new Date(aw);
          nextAshWednesday.setTime(
            nextAshWednesday.getTime() +
              nextAshWednesday.getTimezoneOffset() * 60 * 1000
          );
          nextAshWednesday = nextAshWednesday.toLocaleDateString("en-US");
          break;
        }
      }
    }

    this.setState({
      users,
      isOwner,
      joinComponent,
      postButton,
      community: c,
      ashWednesday: nextAshWednesday,
    });
  }

  post = async () => {
    const {writePostText, writePostPrivacy} = this.state;
    const {uid, currentDay} = this.props;
    const text = writePostText;

    if (
      text !== undefined &&
      text !== null &&
      text.length > 0 &&
      text.length <= 8000
    ) {
      this.setState({isWriting: false, writePostText: null});
      const privacy = writePostPrivacy;
      const post = encodeURI(IgniteHelper.encrypt(text, privacy === 0));
      const date = encodeURI(new Date().toISOString());

      await IgniteHelper.api(
        "user",
        `action=post&uid=${uid}&date=${date}&day=${currentDay}&priv=${privacy}&data=${post}`
      );

      this.setState({doRefresh: true, refreshing: true, refreshPosts: true});
    }
  };

  openPost = (post, user, isOwner) => {
    const {postDetailComponent} = this.state;

    let deletePostButton;
    if (isOwner) {
      deletePostButton = (
        <Button
          onPress={() =>
            this.setState({
              postDetailComponentCache: postDetailComponent,
              postDetailComponent: null,
              deletePost: post.id,
            })
          }
          title="Delete Post"
          type="outline"
          titleStyle={{fontSize: 14, color: "#cc2222"}}
          buttonStyle={{
            borderColor: "#cc2222",
            margin: 10,
            marginLeft: 25,
            marginRight: 25,
          }}
        />
      );
    }
    const newPostDetailComponent = (
      <Overlay
        isVisible={post !== null}
        overlayStyle={{backgroundColor: Colors.modalBackground}}
        onBackdropPress={() => this.setState({postDetailComponent: null})}
      >
        <View style={{flex: 1}}>
          <Button
            onPress={() => this.setState({postDetailComponent: null})}
            title="Close"
            type="outline"
            titleStyle={{fontSize: 14}}
            buttonStyle={{marginTop: 10}}
          />
          {deletePostButton}
          <ListItem
            roundAvatar
            title={user.name}
            subtitle={IgniteHelper.timeSince(new Date(Date.parse(post.date)))}
            leftAvatar={
              <Avatar
                rounded
                title={IgniteHelper.initials(user.name)}
                overlayContainerStyle={{backgroundColor: Colors.primary}}
              />
            }
            containerStyle={{
              backgroundColor: Colors.modalBackground,
              marginBottom: 20,
              marginRight: 100,
              width: "100%",
            }}
            titleStyle={{color: Colors.modalText, fontSize: 18}}
            subtitleStyle={{color: Colors.fadedText, fontSize: 14}}
          />
          <ScrollView style={{flex: 1}}>
            <Text
              style={{marginLeft: 10, lineHeight: 20, color: Colors.modalText}}
            >
              {IgniteHelper.decrypt(post.data, post.privacy === "0")}
            </Text>
          </ScrollView>
        </View>
      </Overlay>
    );
    this.setState({
      isWriting: false,
      cancelWriting: false,
      postDetailComponent: newPostDetailComponent,
    });
  };

  getUsers = async c => {
    let refresh = false;
    if (c === undefined || c === null) {
      const {community} = this.props;
      c = await IgniteHelper.api("community", `action=geti&id=${community}`);
      refresh = true;
    }

    let {members} = c;
    if (typeof members === "string") {
      c.members = JSON.parse(c.members);
      members = c.members;
    }
    const users = await Promise.all(
      members.map(async m => {
        const u = await IgniteHelper.getUser(m);
        return u;
      })
    );
    if (refresh) {
      const {refreshPosts} = this.state;
      this.setState({refreshing: refreshPosts, refreshUsers: false});
    }
    return users;
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  render() {
    // joinComponent = a share-join-code view if the community has not started the retreat yet
    // postDetailComponent = if a user taps on a post, this component will show the details
    const {
      community,
      postButton,
      joinComponent,
      isOwner,
      loadMore,
      doRefresh,
      refreshing,
      refreshUsers,
      refreshPosts,
      users,
      pickDate,
      ashWednesday,
      chosenStartDate,
      isWriting,
      writePostText,
      writePostPrivacy,
      cancelWriting,
      deletePost,
      postDetailComponent,
      postDetailComponentCache,
      error,
    } = this.state;
    const {startedAt, currentDay, daysUntil, uid, reauth} = this.props;

    if (community === undefined) {
      return <LoadingScreen />;
    }

    // a button to create posts, which is disabled before the user starts the retreat
    let conditionalPostButton;
    if (startedAt) {
      conditionalPostButton = postButton;
    }

    let postList;
    let startButton;
    let startText;
    if (daysUntil > 0) {
      startText = (
        <Text style={{textAlign: "center", marginBottom: 10}}>
          Ignite will begin in {daysUntil} day{daysUntil === 1 ? "" : "s"}, on{" "}
          {new Date(
            this.today.getTime() +
              daysUntil * 24 * 60 * 60 * 1000 +
              this.today.getTimezoneOffset() * 60 * 1000
          ).toLocaleDateString("en-US")}
          .
        </Text>
      );
    }
    if (startedAt) {
      postList = (
        <PostList
          title="POSTS"
          previewWordLimit={5}
          uid={uid}
          currentDay={currentDay}
          openPost={this.openPost}
          doRefresh={refreshPosts}
          loadMore={loadMore}
          refreshing={set =>
            this.setState({refreshing: set || refreshUsers, refreshPosts: set})
          }
        />
      );
    } else if (isOwner) {
      let buttonText = "Choose retreat start date";
      if (daysUntil > 0) {
        buttonText = "Change retreat start date";
      }
      startButton = (
        <Button
          title={buttonText}
          type="solid"
          onPress={() => this.setState({pickDate: true})}
          style={{width: "100%", marginBottom: 10}}
        />
      );
    }

    // reset refreshing post list
    if (doRefresh) {
      this.setState({doRefresh: false});
    }

    // reset signal to load more of post list
    if (loadMore) {
      this.setState({loadMore: false});
    }

    const month = IgniteHelper.padnum(this.today.getMonth() + 1, 2, "0");
    const day = IgniteHelper.padnum(this.today.getDate(), 2, "0");

    const todayString = `${this.today.getFullYear()}-${month}-${day}`;
    const maxDateString = `${this.today.getFullYear() + 1}-${month}-${day}`;

    /* TODO: Rewrite confirmation overlays with react-native-awesome-alerts */
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              this.setState({
                doRefresh: true,
                refreshPosts: startedAt,
                refreshUsers: true,
                refreshing: true,
              });
              this.getUsers(null);
            }}
          />
        }
        onScroll={({nativeEvent}) => {
          if (this.isCloseToBottom(nativeEvent)) {
            this.setState({loadMore: true});
          }
        }}
        style={{backgroundColor: Colors.background, height: "100%"}}
      >
        <Header title="Community" />
        <View style={styles.container}>
          {joinComponent}
          {startButton}
          {startText}
          <UserList
            title={community.name}
            users={users}
            style={styles.userlist}
          />
          {conditionalPostButton}
          {postList}
        </View>

        <Overlay
          isVisible={pickDate}
          overlayStyle={{backgroundColor: Colors.modalBackground, height: 300}}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{fontSize: 26, color: Colors.modalText}}>
              Set Start Date
            </Text>
            <Text style={{color: Colors.modalText}}>
              Ash Wednesday will be on {ashWednesday}.
            </Text>
            <DatePicker
              style={{width: 200}}
              date={chosenStartDate}
              mode="date"
              placeholder="Tap to choose date"
              format="YYYY-MM-DD"
              minDate={todayString}
              maxDate={maxDateString}
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              onDateChange={date => {
                this.setState({chosenStartDate: date});
              }}
            />
            <Text style={{color: Colors.modalText}}>
              You can change the start date until Ignite begins.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 40,
                marginBottom: 40,
              }}
            >
              <Button
                onPress={() =>
                  this.setState({
                    pickDate: false,
                    chosenStartDate: null,
                  })
                }
                title="Cancel"
                type="outline"
                titleStyle={{fontSize: 16}}
                buttonStyle={{marginRight: 10}}
              />
              <Button
                onPress={async () => {
                  const startDate = chosenStartDate;
                  const result = await IgniteHelper.api(
                    "community",
                    /* eslint-disable react/destructuring-assignment */
                    `action=ignite&id=${encodeURI(
                      this.props.community
                    )}&start=${encodeURI(startDate)}`
                    /* eslint-enable react/destructuring-assignment */
                  );
                  const {success} = result;
                  if (success === "1") {
                    this.setState({pickDate: false});
                    reauth();
                  } else {
                    const errorCode = result.error;
                    if (errorCode === "41") {
                      // Not enough members in community
                      this.setState({
                        pickDate: false,
                        error: "You need at least 4 members in your community.",
                      });
                    } else if (errorCode === "43") {
                      // Too many members
                      this.setState({
                        pickDate: false,
                        error:
                          "You can only have up to 10 members in your community.",
                      });
                    } else {
                      // Other error
                      this.setState({
                        pickDate: false,
                        error: `Sorry, something went wrong. Please try again. [Error ${errorCode}]`,
                      });
                    }
                  }
                }}
                title="Confirm"
                type="solid"
                titleStyle={{fontSize: 16}}
                buttonStyle={{
                  backgroundColor: "#228822",
                  marginLeft: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              />
            </View>
          </View>
        </Overlay>

        <Overlay
          isVisible={isWriting}
          overlayStyle={{backgroundColor: Colors.modalBackground}}
        >
          <View style={{flex: 1}}>
            <TextInput
              placeholder=" Write your post here!"
              placeholderTextColor={Colors.fadedText}
              multiline={true}
              maxLength={8000}
              onChangeText={text => this.setState({writePostText: text})}
              value={writePostText}
              style={{
                backgroundColor: Colors.modalBackground,
                color: Colors.modalText,
                margin: 10,
                borderRadius: 5,
                borderColor: "#888888",
                borderWidth: 1,
                borderStyle: "solid",
                flex: 1,
              }}
            />
            <Text
              style={{
                marginLeft: 10,
                marginTop: 30,
                fontSize: 18,
                color: Colors.fadedText,
              }}
            >
              Visibility
            </Text>
            <ButtonGroup
              onPress={i => this.setState({writePostPrivacy: i})}
              selectedIndex={writePostPrivacy}
              buttons={["Myself", "Community", "Everyone"]}
              containerStyle={{height: 30, backgroundColor: "transparent"}}
              textStyle={{fontSize: 14}}
              buttonStyle={{backgroundColor: "transparent"}}
            />
            <Text
              style={{
                color: Colors.fadedText,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {writePostPrivacy
                ? writePostPrivacy > 1
                  ? "Everyone using the app will be able to see this post."
                  : "Only your community will be able to see this post."
                : "Only you will be able to see this post."}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 40,
                marginBottom: 40,
              }}
            >
              <Button
                onPress={() =>
                  this.setState({
                    isWriting: false,
                    cancelWriting: true,
                  })
                }
                title="Cancel"
                type="outline"
                titleStyle={{fontSize: 16}}
                buttonStyle={{marginRight: 10}}
              />
              <Button
                onPress={this.post}
                title="Post"
                type="solid"
                titleStyle={{fontSize: 16}}
                buttonStyle={{
                  backgroundColor: "#228822",
                  marginLeft: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}
              />
            </View>
          </View>
        </Overlay>

        <Overlay
          isVisible={cancelWriting}
          overlayStyle={{backgroundColor: Colors.modalBackground}}
          onBackdropPress={() =>
            this.setState({
              isWriting: true,
              cancelWriting: false,
            })
          }
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                marginBottom: 10,
                textAlign: "center",
                color: Colors.modalText,
              }}
            >
              Are you sure you want to discard your post?
            </Text>
            <View style={{flexDirection: "row"}}>
              <Button
                onPress={() =>
                  this.setState({
                    isWriting: true,
                    cancelWriting: false,
                  })
                }
                title="Keep Writing"
                type="outline"
                titleStyle={{fontSize: 16}}
                buttonStyle={{marginRight: 10}}
              />
              <Button
                onPress={() =>
                  this.setState({
                    cancelWriting: false,
                    writePostText: null,
                  })
                }
                title="Discard Post"
                type="solid"
                titleStyle={{fontSize: 16}}
                buttonStyle={{backgroundColor: "#cc2222", marginLeft: 10}}
              />
            </View>
          </View>
        </Overlay>

        <Overlay
          isVisible={
            deletePost !== undefined &&
            deletePost !== null &&
            deletePost !== false
          }
          overlayStyle={{backgroundColor: Colors.modalBackground}}
          onBackdropPress={() =>
            this.setState({
              postDetailComponent: postDetailComponentCache,
              postDetailComponentCache: null,
              deletePost: false,
            })
          }
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                marginBottom: 10,
                textAlign: "center",
                color: Colors.modalText,
              }}
            >
              Are you sure you want to delete your post?
            </Text>
            <View style={{flexDirection: "row"}}>
              <Button
                onPress={() =>
                  this.setState({
                    postDetailComponent: postDetailComponentCache,
                    postDetailComponentCache: null,
                    deletePost: false,
                  })
                }
                title="Cancel"
                type="outline"
                titleStyle={{fontSize: 16}}
                buttonStyle={{marginRight: 10}}
              />
              <Button
                onPress={() => {
                  IgniteHelper.api("user", `action=delp&id=${deletePost}`);
                  this.setState({
                    postDetailComponentCache: null,
                    deletePost: false,
                    doRefresh: true,
                  });
                }}
                title="Delete Post"
                type="solid"
                titleStyle={{fontSize: 16}}
                buttonStyle={{backgroundColor: "#cc2222", marginLeft: 10}}
              />
            </View>
          </View>
        </Overlay>
        {postDetailComponent}
        <AwesomeAlert
          show={error !== null && error !== undefined}
          showProgress={false}
          title="Error"
          message={error}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#DD6B55"
          onConfirmPressed={() => this.setState({error: null})}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "stretch",
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 50,
  },
  userlist: {
    borderRadius: 10,
    width: "100%",
    marginLeft: 0,
    marginBottom: 20,
  },
  joincodeText: {
    fontSize: 64,
    fontFamily: "ClaxtonLight",
    padding: 10,
    textAlign: "center",
    borderRadius: 5,
    color: Colors.text,
  },
  joincodeTitle: {
    color: Colors.text,
    fontSize: 24,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  joincodeDesc: {
    color: Colors.text,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
});
