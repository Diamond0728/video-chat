import Axios from 'axios'
import { wrapAuth } from '@ruguoapp/jike-auth-axios'
import { HOST } from './constant'

export const authAxios = wrapAuth(Axios.create({
  baseURL: HOST,
}))

export const getMusicList = (topicId) =>
  authAxios.get(`https://activity-beta.jike.ruguoapp.com/1.0/playlist/show?topicid=${topicId}`)

export const getAudioMeta = (url) =>
  authAxios.post(`https://activity-beta.jike.ruguoapp.com/1.0/playlist/extract`, { url })
