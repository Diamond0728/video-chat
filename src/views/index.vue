<template>
  <div>
    <h1>Realtime communication with WebRTC</h1>
    <v-btn 
    v-for="(username, index) in usernames" 
    :key="index" 
    block
    @click="call(username)">
      {{username}}
    </v-btn>
    <div v-if="callFrom !==''">
      {{callFrom}}
      <v-btn @click="accept()">接听</v-btn>
      <v-btn @click="refuse()">挂断</v-btn>
    </div>

    <video id="localVideo" autoplay playsinline></video>
    <video id="remoteVideo" autoplay playsinline></video>

    <div>
      <button @click="start()">Start</button>
      <button @click="call()">CallAction</button>
      <button @click="hangUp()">Hang Up</button>
    </div>

  </div>
</template>

<script>
/* eslint-disable*/
import {trace} from '@/main.js'
import axios from 'axios'
import * as _ from 'lodash'
// import axios from 'axios'
export default {
  data () {
    return {
      sharetoken: '',
      localStream: '',
      localPeerConnection: '',
      remotePeerConnection: '',
      sock: '',
      stomp: '',
      socket: '',
      stompClient: '',
      usernames: [],
      callFrom: '',
      targetUsername: '',
    }
  },
  computed: {
    localVideo: () => document.getElementById("localVideo"),
    remoteVideo: () => document.getElementById("remoteVideo")
  },
  async mounted () {
    let _self = this
    // alert(this.user.username)
    if(this.user.username === '') {
      this.$router.replace('/login')
      return
    }
    this.socketConnect()
    setTimeout(this.broad,3000)
  },
  methods: {
    socketConnect() {
      let _self = this
      this.sock = new SockJS("/root/endpointChat")
      this.stomp = Stomp.over(this.sock)
      _self.stomp.connect('guest', 'guest', function(frame) {
        console.log(frame)
        _self.stomp.subscribe("/user/queue/notifications", (message) => {
          const messageBody = eval('(' + message.body + ')')
          // const description = messageBody.content
          if(messageBody.type === 'send') {
            const description = eval('(' +messageBody.content + ')')
            _self.createAnswer(description, messageBody.from)
          }
          else if(messageBody.type === 'tryCall') {
            _self.callFrom = messageBody.from
          }
          else if(messageBody.type === 'accept') {
            _self.link(messageBody.from)
          }
          else {
            const description = eval('(' +messageBody.content + ')')
            _self.localPeerConnection.setRemoteDescription(description)
          }
        })
      })

      _self.socket =  new SockJS("/root/endpointChat");
      _self.stompClient = Stomp.over(_self.socket)
      _self.stompClient.connect({}, function (frame) {//连接WebSocket服务端
        console.log(frame)
        _self.stompClient.subscribe("/topic/users/list", function (msg) {//通过stopmClient.subscribe订阅"/topic/response"目标发送的消息，这个路径是在控制器的@SendTo中定义的
          const users = eval('(' + msg.body + ')')
          _self.usernames = _.map(users, 'username')
          console.log(_self.usernames)
        });
      })

    },
    broad() {
      let _self = this 
      _self.stompClient.send("/api/entrance", {}, JSON.stringify());
    },

    async call(targetUsername) {
      let _self = this
      
      _self.stomp.send("/api/chat", {}, JSON.stringify({
        'username': targetUsername,
        'type': 'tryCall',
        'content':  ''
      }))
      // await _self.start()
      // await _self.callAction()
      // _self.createOffer(targetUsername)
    },

    async accept() {
      let _self = this
      await _self.start()
      await _self.callAction()
      _self.createOffer(_self.targetUsername)
      _self.createOffer(_self.targetUsername)
      _self.stomp.send("/api/chat", {}, JSON.stringify({
        'username': _self.targetUsername,
        'type': 'accept',
        'content':  ''
      }))
    },
    async link(targetUsername) {
      let _self = this
      await _self.start()
      await _self.callAction()
      _self.createOffer(targetUsername)
      // _self.stomp.send("/api/chat", {}, JSON.stringify({
      //   'username': _self.targetUsername,
      //   'type': 'accept',
      //   'content':  ''
      // }))
    },

    async start() {
      let _self = this
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        // audio:true
      })
      // .then( mediaStream => {
      console.log(_self.localVideo)
      _self.localVideo.srcObject = mediaStream;
      _self.localStream = mediaStream;
      trace('Received local stream.');
      // })
      // .catch( error => {
      //   trace(`navigator.getUserMedia error: ${error.toString()}.`);
      // });
      trace('Requesting local stream.');
    },
    async callAction() {
      let _self = this
      // 获取媒体流
      const videoTracks = _self.localStream.getVideoTracks();
      const audioTracks = _self.localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        trace(`Using video device: ${videoTracks[0].label}.`);
      }
      if (audioTracks.length > 0) {
        trace(`Using audio device: ${audioTracks[0].label}.`);
      }
      // 定义本地连接
      _self.localPeerConnection = new RTCPeerConnection({});
      trace('Created local peer connection object localPeerConnection.');
      _self.localPeerConnection.addEventListener('icecandidate', event => {
        const peerConnection = event.target;
        const iceCandidate = event.candidate;
        if (iceCandidate) {
          const newIceCandidate = iceCandidate;
          const otherPeer = (peerConnection === _self.localPeerConnection) ? _self.remotePeerConnection : _self.localPeerConnection;
          console.log(1000)
          console.log(newIceCandidate)
          otherPeer.addIceCandidate(newIceCandidate)
            .then(() => {
              trace(`${_self.getPeerName(peerConnection)} addIceCandidate success.`);
            }).catch((error) => {
              trace(`${_self.getPeerName(peerConnection)} failed to add ICE Candidate:\n`+`${error.toString()}.`);
            });
        }
      });
      _self.localPeerConnection.addEventListener('iceconnectionstatechange', event => {
        const peerConnection = event.target;
        console.log('ICE state change event: ', event);
        trace(`${_self.getPeerName(peerConnection)} ICE state: ` + `${peerConnection.iceConnectionState}.`);
      });
      // 定义远程连接
      _self.remotePeerConnection = new RTCPeerConnection({});
      trace('Created remote peer connection object remotePeerConnection.');

      _self.remotePeerConnection.addEventListener('icecandidate', event => {
        const peerConnection = event.target;
        const iceCandidate = event.candidate;

        if (iceCandidate) {
          const newIceCandidate = new RTCIceCandidate(iceCandidate);
          const otherPeer = (peerConnection === _self.localPeerConnection) ? _self.remotePeerConnection : _self.localPeerConnection;

          otherPeer.addIceCandidate(newIceCandidate)
            .then(() => {
              trace(`${_self.getPeerName(peerConnection)} addIceCandidate success.`);
            }).catch((error) => {
              trace(`${_self.getPeerName(peerConnection)} failed to add ICE Candidate:\n`+`${error.toString()}.`);
            });

          // trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
          //       `${event.candidate.candidate}.`);
        }
      });
      _self.remotePeerConnection.addEventListener('iceconnectionstatechange', event => {
        const peerConnection = event.target;
        console.log('ICE state change event: ', event);
        trace(`${_self.getPeerName(peerConnection)} ICE state: ` + `${peerConnection.iceConnectionState}.`);
      });
      _self.remotePeerConnection.addEventListener('addstream', event => {
        alert('addstream')
        const mediaStream = event.stream;
        alert(mediaStream)
        _self.remoteVideo.srcObject = mediaStream;
        _self.remoteStream = mediaStream;
        trace('Remote peer connection received remote stream.');
      });

      // Add local stream to connection and create offer to connect.
      _self.localPeerConnection.addStream(_self.localStream);
      trace('Added local stream to localPeerConnection.');
    },

    async createOffer(targetUsername) {
      let _self = this
      trace('localPeerConnection createOffer start.');
      const description = await _self.localPeerConnection.createOffer({offerToReceiveVideo: 1})
      // .then(description => {
        trace(`Offer from localPeerConnection:\n${description.sdp}`);

        trace('localPeerConnection setLocalDescription start.');
        console.log("==============")
        console.log(description)
        console.log("==============")
        _self.localPeerConnection.setLocalDescription(description)
        console.log("send websocket")
        _self.stomp.send("/api/chat", {}, JSON.stringify({'username': targetUsername,
          'type': 'send',
          'content':  JSON.stringify(description)
        }))
      // })
    },
    createAnswer(description, from) {
      let _self = this
      trace('remotePeerConnection setRemoteDescription start.');
      _self.remotePeerConnection.setRemoteDescription(description)

      trace('remotePeerConnection createAnswer start.');
      _self.remotePeerConnection.createAnswer()
      .then(desc => {
        trace(`Answer from remotePeerConnection:\n${desc.sdp}.`);

        trace('remotePeerConnection setLocalDesc start.');
        _self.remotePeerConnection.setLocalDescription(desc)
        trace('localPeerConnection setRemoteDescription start.');
        // _self.localPeerConnection.setRemoteDescription(desc)
        _self.stomp.send("/api/chat", {}, JSON.stringify({'username': from,
        'type': 'match',
        'content':  JSON.stringify(desc)}))
      })
    },
    getPeerName(peerConnection) {
      let _self = this
      return (peerConnection === _self.localPeerConnection) ?
          'localPeerConnection' : 'remotePeerConnection';
    },
  }
}
</script>

<style lang="stylus">
</style>
<style lang="scss" scoped>
@import '../jike-styles.scss';
.entrance{
  background-color: $color-grey-5;
  width: 100%;
  height: 150px;
  border: 1px solid $color-grey-5;
  .btn {
    margin-top: 50px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: $color-jike-yellow;
    width: 40%;
    font-size: $font-heading-1-font-size;
    line-height: $font-heading-1-line-height;
    color: $font-heading-1-color;
    letter-spacing: $font-heading-1-letter-spacing;
    font-style: $font-heading-1-font-style;
    font-weight: $font-heading-1-font-weight;
    font-family: $font-heading-1-font-family; 
    border-radius:25px;
  }
}  
</style>


