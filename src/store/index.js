import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
    plugins: [
        createPersistedState({
            reducer: (persistedState) => {
                const stateFilter = JSON.parse(JSON.stringify(persistedState)); // deep clone
                return stateFilter
            }
        })
    ],
    state: {
        user_token: null,
        user_name: null,
        sex: null,
        className: null,
        avatar: null,
        role: null
      },
      mutations: {
        setToken (state, token) {
          state.user_token = token
        },
        setUserName (state, name) {
          state.user_name = name
        },
        setSex (state, sex) {
          state.sex = sex
        },
        setClassName (state, className) {
          state.className = className
        },
        setAvatar (state, avatar) {
          state.avatar = avatar
        },
        setRole (state, role) {
          state.role = role
        },
        clearAll (state) {
          state.user_token = null
          state.user_name = null
          state.sex = null
          state.className = null
          state.avatar = null
          state.role = null
        }
      },
      actions: {
        setToken ({commit}, token) {
          commit('setToken', token)
        },
        setUserName ({commit}, name) {
          commit('setUserName', name)
        },
        setSex ({commit}, sex) {
          commit('setSex', sex)
        },
        setClassName ({commit}, className) {
          commit('setClassName', className)
        },
        setAvatar ({commit}, avatar) {
          commit('setAvatar', avatar)
        },
        setRole ({commit}, role) {
          commit('setRole', role)
        },
        clearUserInfo ({commit}) {
          commit('clearAll')
        }
      },
      getters: {
        getToken (state) {
          return state.user_token
        },
        getUserName (state) {
          return state.user_name
        },
        getSex (state) {
          return state.sex
        },
        getClassName (state) {
          return state.className
        },
        getAvatar (state) {
          return state.avatar
        },
        getRole (state) {
          return state.role
        }
      }
})