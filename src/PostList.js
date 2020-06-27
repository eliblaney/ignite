import React from "react";
import {FlatList, View, StyleSheet} from "react-native";
import {ButtonGroup, Text} from "react-native-elements";
import Colors from "./Colors";
import IgniteHelper from "./IgniteHelper";
import LoadingScreen from "./LoadingScreen";
import PostElement from "./PostElement";

export default class PostList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      postData: [],
      posts: [],
      loading: true,
      filter: 1,
    };
    // offset variable for posts
    this.page = 1;
    this.refreshing = false;
    this.loadingMore = false;
  }

  async componentDidMount() {
    const {uid} = this.props;

    const user = await IgniteHelper.getUser(uid);
    this.setState({user});
    this.read();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !nextState.loading && nextState.posts.length === nextState.users.length
    );
  }

  async componentDidUpdate() {
    const {loading} = this.state;
    const {doRefresh, refreshing, loadMore} = this.props;

    if (doRefresh && !this.refreshing && !loading) {
      this.refreshing = true;
      refreshing(true);
      await this.read(true);
      refreshing(false);
      this.refreshing = false;
    }
    if (loadMore && !loading) {
      await this.read(false);
    }
  }

  populateUsers = async () => {
    const {posts} = this.state;

    const users = await Promise.all(
      posts.map(async (p, i) => {
        const u = await IgniteHelper.getUser(p.user);
        return u;
      })
    );
    this.setState({users, loading: false});
  };

  read = async (clean = false) => {
    const {uid, currentDay} = this.props;
    const {postData} = this.state;
    let posts = postData;

    if (clean) {
      this.page = 1;
      posts = [];
    }
    const data = await IgniteHelper.api(
      "user",
      `action=read&uid=${uid}&day=${currentDay}&page=${this.page}`
    );
    const newposts = data.posts || []; // if there are no posts to display, server returns undefined for data.posts

    const itemsPerPage = 5; // api returns posts in blocks of 5
    if (newposts.length < itemsPerPage) {
      // if the new page is incomplete (or empty),
      // then this is the end of the list

      if (posts.length % itemsPerPage > 0) {
        // if there's an incomplete page,
        // then it will get overwritten
        //
        // this is usually an issue when
        // the user or community has
        // less than 5 posts total
        while (posts.length % itemsPerPage > 0) {
          posts.pop();
        }
      }
    } else {
      this.page++;
    }

    posts.push(...newposts);

    // difference between postData and posts
    // postData = all posts
    // posts = filtered so that posts from the future points in the retreat aren't shown
    // it is organized this way so that the indices between api posts and user uids are synchronized
    this.setState({
      postData: posts,
      posts: posts.filter(p => p.distance >= 0),
    });
    this.populateUsers();
  };

  filter = i => {
    this.setState({filter: i});
  };

  render() {
    const {loading, filter, user, posts, users} = this.state;
    const {style, title, openPost, uid, previewWordLimit} = this.props;

    if (loading) {
      return <LoadingScreen />;
    }

    const {community} = user;

    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.filterText}>Filter</Text>
        <ButtonGroup
          onPress={this.filter}
          selectedIndex={filter}
          buttons={["Myself", "Community", "Everyone"]}
          containerStyle={{height: 30, backgroundColor: "transparent"}}
          textStyle={{fontSize: 14}}
          buttonStyle={{backgroundColor: "transparent"}}
        />

        <FlatList
          data={posts}
          extraData={[posts, filter]}
          renderItem={item => {
            const p = item.item;
            const u = users[item.index];

            if (u === undefined) {
              // users are still being queried
              return null;
            }
            if (filter === 0 && p.u !== uid) {
              return null;
            }
            if (filter === 1 && p.community !== community) {
              return null;
            }

            return (
              <PostElement
                key={item.index}
                id={item.index}
                post={p}
                openPost={openPost}
                user={u}
                owner={u.uid === uid}
                previewWordLimit={previewWordLimit}
              />
            );
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.modalBackground,
    marginTop: 20,
  },
  title: {
    color: Colors.modalText,
    fontSize: 20,
    textAlign: "center",
  },
  filterText: {
    textAlign: "left",
    fontSize: 18,
    color: Colors.fadedText,
    marginLeft: 10,
  },
});
