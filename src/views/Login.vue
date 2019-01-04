<template>
  <div>
    <div align="center" style="padding-top:50%; padding-left:40px; padding-right:40px;">
      <v-text-field
        label="为自己取一个响亮的名字吧"
        v-model="username"
        :error="error"
      ></v-text-field>
      <v-btn :loading="loading" 
      block
      color="success"
      @click="register()">进入</v-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      loading: false,
      username: '',
      error: false
    }
  },
  mounted() {
    // this.register()
  },
  
  methods: {
    register() {
      let _self = this
      if(_self.username === '') {
        alert('别忘了给自己起一个响亮的名字')
        _self.error = true
        return
      }
      _self.loading = true
      axios.post("/api/register", {username: _self.username})
      .then(response =>{
        if(response.data.success){
          _self.user.username = response.data.data.username
          setTimeout(_self.jump,1000)
        } else {
          alert(response.data.message)
          _self.loading = false
        }
        // stompClient.send("/api/entrance", {}, JSON.stringify([{username}]));
      })
    },
    jump () {
      let _self = this
      _self.loading = false
      _self.$router.replace('/index')
    }
  }
}
</script>

<style lang="scss">
</style>


