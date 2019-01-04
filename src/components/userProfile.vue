<template>
  <div class="userProfile">
    <img :src="user.profileImage.middlePicUrl" class="portrait" style="vertical-align: top;" click="profile">
    
    <div style="display:inline-block;width:80%;padding-top:6px;vertical-align: top;">
      <div style="margin: 0px 10px;">
        <div style="display:inline-block;width:60%;vertical-align: top;">
          <div style="margin-left:4px;">
            <div class="screenName">{{user.screenName}}</div>
            <span class="topic" @click="shareTopic">
              街头摄影扫街组成员
            </span>
          </div>
        </div>
        <div align="right" style="display:inline-block; width:40%;vertical-align: top;">
          <div class="child">
            <div class="count">{{totalLike}}</div>
            <div class="name">点赞</div>
          </div>
          <div class="child">
            <div class="count">{{totalComment}}</div>
            <div class="name">评论</div>
          </div>
        </div>
      </div>
      <div align="center" style="padding-top:2px">
        <div v-if="!isMe" class="btn" @click="focus">
          +&nbsp;关&nbsp;注
        </div>
        <div v-if="isMe" class="btn" @click="profile">
          主&nbsp;&nbsp;页
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['user', 'totalLike', 'totalComment', 'isMe'],
  data () {
    return {
      topic: ''
    }
  },
  mounted() {
    const url = window.location.href
    this.topic = url.match(/topic=(\S*)#\//)[1];
  },
  methods: {
    shareTopic() {
      window.location.href = `https://m.okjike.com/topics/${this.topic}?source_username=${this.user.id}`
    },
    focus() {
      window.location.href =`jike://page.jk/user/${this.user.id}`
      this.makeAlert()
    },
    profile() {
      window.location.href = `jike://page.jk/user/me`
      if(!this.isMe)
        this.makeAlert()
    },
    makeAlert() {
      let options = {
        okText: '加入即刻',
        cancelText: '关闭',
        type: 'softs', 
      }
      this.$dialog
      .confirm('来即刻，和更多有趣的即友相遇', options)
      .then(function(dialog) {
        window.location.href = `https://a.app.qq.com/o/simple.jsp?pkgname=com.ruguoapp.jike&ckey=CK1409335080262`
        console.log(dialog)
      })
    }
  }
}
</script>


<style lang="scss" scoped>
@import '../jike-styles.scss';
.userProfile{
  background-color:#fff; 
  padding-bottom:10px; 
  position:fixed;
  top:0px;
  width:100%;
  padding: 2px 5px;
  z-index: 9;
  // box-shadow: 0px 1px 2px 1px #ddd
}
.portrait{
  width: 20%;
  border-radius:50%;
  display: inline-block;
  padding-top: 4px;
}
.screenName {
  @include font-heading-2;
}
.child{
  display: inline-block;
  margin-left: 20px;
  vertical-align: top;
  .count {
    font-size: $font-heading-1-font-size;
    line-height: $font-heading-1-line-height;
    color: $font-heading-1-color;
    letter-spacing: $font-heading-1-letter-spacing;
    font-style: $font-heading-1-font-style;
    font-weight: $font-heading-1-font-weight;
    font-family: $font-heading-1-font-family;
    text-align: center;
  }
  .name {
    font-size: $font-para-2-font-size;
    line-height: $font-para-2-line-height;
    color: $font-para-2-color;
    letter-spacing: $font-para-2-letter-spacing;
    font-style: $font-para-2-font-style;
    font-weight: $font-para-2-font-weight;
    font-family: $font-para-2-font-family;
    text-align: right;
  }
}

.btn {
  margin: 0px 10px;
  padding: 0px 0px;
  border-radius: 15px;
  background-color: $color-jike-blue;
  font-size: 18px;
  line-height: $font-heading-1-line-height;
  color: #fff;
  letter-spacing: $font-heading-1-letter-spacing;
  font-style: $font-heading-1-font-style;
  font-weight: $font-heading-1-font-weight;
  font-family: $font-heading-1-font-family; 
  margin-top: 3px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 6px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  // display: inline;
}
.topic{
  padding: 2px 6px;
  font-size: 11px;
  line-height: $font-label-blue-line-height;
  text-align: $font-label-blue-text-align;
  color: $font-label-blue-color;
  letter-spacing: $font-label-blue-letter-spacing;
  font-style: $font-label-blue-font-style;
  font-weight: $font-label-blue-font-weight;
  font-family: $font-label-blue-font-family;
  background-color: $color-grey-4;
  border-radius: 10px;
  // display: inline;
}
</style>

