<template>
    <div class="auth-wrapper" :style="'height: ' + windowHeight + 'px'">
        <div  class="auth-form text-center">
            <img src="img/icons/logo.png" alt="record" class="icon-biggest">
            <p class="fn-18 fn-bold fn-black">您好, 欢迎来到 iTeacher</p>
            <div class="tab-header">
                <div class="tab-item fn-16" :class="selectedTabID == 0 ? 'active' : ''" @click="selectedTabID = 0">账号密码登录</div>
                <div class="tab-item fn-16" :class="selectedTabID == 1 ? 'active' : ''" @click="selectedTabID = 1">短信验证登录</div>
            </div>
            <div class="user-input row">
                <div v-if="phone_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{phone_err}}</div>
                <div class="col-1 pl-0 pr-0"><img src="img/icons/phone.png" class="form-icon"></div> 
                <div class="col-11 pl-0 pr-0"><input class="width-full" v-model="phone" type="text" autocomplete="username" placeholder="请输入手机号码"></div> 
            </div>

            <div v-if="selectedTabID" class="user-input row">
                <div v-if="code_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{code_err}}</div>
                <div class="col-1 pl-0 pr-0"><img src="img/icons/lock.png" class="form-icon"></div> 
                <div class="col-8 pl-0 pr-0"><input class="width-full" v-model="code" type="text" placeholder="请输入验证码"></div> 
                <div class="col-3 pl-0 pr-0">
                    <div v-if="elapsedTime" class="border_1_muted radius_4 fn-12">请等待{{elapsedTime}}s</div>
                    <button v-else type="button" 
                        class="btn btn-outline-primary width-full fn-11 pr-2 pl-2 pt-1 pb-1"
                        @click="verificatePhone">获取验证码</button>
                </div> 
            </div>
            <div v-else class="user-input row">
                <div v-if="password_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{password_err}}</div>
                <div class="col-1 pl-0 pr-0"><img src="img/icons/lock.png" class="form-icon"></div> 
                <div class="col-11 pl-0 pr-0"><input class="width-full" v-model="password" type="password" placeholder="请输入密码"></div> 
            </div>
            
            <div class="row fn-11 fn-info pl-2 pr-2 pt-3 pb-3">
                <router-link to="/register" class="col-6 text-left">注册账号</router-link>
                <router-link v-if="!selectedTabID" to="/resetpassword" class="col-6 text-right">忘记密码</router-link>
            </div>
            <div class="pr-5 pl-5 mt-4 mb-4">
                <button type="button" class="btn btn-oval btn-primary width-full fn-20" @click="userLogin">登录</button>
            </div>
            <!-- <div class="row pr-4 pl-4 mr-4 ml-4 pt-3 text-muted">
                <div class="col-4">
                    <img src="img/icons/social_1.png" class="icon-standard cursor-pointer">
                    <div>微信登录</div>
                </div>
                <div class="col-4">
                    <img src="img/icons/social_2.png" class="icon-standard cursor-pointer">
                    <div>QQ登录</div>
                </div>
                <div class="col-4" @click="guestLogin">
                    <img src="img/icons/social_3.png" class="icon-standard cursor-pointer">
                    <div>游客登录</div>
                </div>
            </div> -->
        </div>
    </div>
</template>
<script>
    var md5 = require('md5');
    import axios from 'axios'
    import swal from 'sweetalert2'
    export default {
        data () {
            return {
                windowHeight: 0,
                selectedTabID: 0,
                phone: '',
                password: '',
                code: '',
                
                phone_err: null,
                password_err: null,
                code_err: null,

                timerID: null,
                elapsedTime: 0
            }
        },
        watch: {
            phone: function(val){ this.phone_err = null },
            password: function(val){ this.password_err = null },
            code: function(val){ this.code_err = null },
            selectedTabID: function(val){
                this.phone_err = null;
                this.password_err = null;
                this.code_err = null;

                this.password = '';
                this.code = '';
            }
        },
        mounted() {
            // console.log(this.$store);
            this.$store.dispatch('clearUserInfo');
        },
        created() {
            window.addEventListener('resize', this.handleResize)
            this.handleResize();
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.handleResize);

            if(this.timerID) {
                clearInterval(this.timerID);
                this.timerID = null;
            }
        },
        methods: {
            handleResize() {
                this.windowHeight = window.innerHeight;
            },
            verificatePhone(){
                if(!this.phone) { this.phone_err = '入手机号码为空. 请输入手机号码.'; return}
                else if(this.phone.length != 11) { this.phone_err = '手机号码不正确. 请输入11位数字.'; return};

                var _this = this;
                axios.post(this.$serverURL + '/sms_auth/0', {phone: this.phone})
                    .then(function (response) {
                        if(response.data.success){
                            _this.elapsedTime = 60;
                            _this.timerID = setInterval(_this.update, 1000);
                        }else{
                            if(response.data.error.type) _this.phone_err = response.data.error.msg;
                            else _this.phone_err = response.data.error;
                        }
                    })
            },
            userLogin(){
                let loginData = {phone: this.phone};
                if(!loginData.phone) this.phone_err = '入手机号码为空. 请输入手机号码.';

                if(this.selectedTabID) {
                    if(this.code) loginData['code'] = this.code;
                    else this.code_err = '验证码为空. 请输入验证码.';
                }else{
                    if(!this.password) this.password_err = '密码为空. 请输入密码.';
                    else{
                        if(this.passwordIsValid(this.password)) loginData['password'] = md5(this.password);
                        else this.password_err = '密码不正确.'
                    }
                } 

                if(this.phone_err || this.password_err || this.code_err) return;

                var _this = this
                axios.post(this.$serverURL + '/student/login', loginData)
                    .then(function (response) {
                        response = response.data;
                        console.log(response);
                        if(response.success){
                            _this.$store.dispatch('setToken', response.userInfo.token)
                            _this.$store.dispatch('setUserName', response.userInfo.name)
                            _this.$store.dispatch('setSex', response.userInfo.sex)
                            _this.$store.dispatch('setClassName', response.userInfo.class)
                            _this.$store.dispatch('setAvatar', response.userInfo.avatar_url)
                            _this.$store.dispatch('setRole', response.userInfo.role)

                            _this.$router.push('/');
                        }else if(response.error){
                            if(response.error.type == 'phone') _this.phone_err = response.error.msg;
                            else if(response.error.type == 'password') _this.password_err = response.error.msg;
                            else if(response.error.type == 'code') _this.code_err = response.error.msg;
                            else _this.showAlert(response.error);
                        }
                    })
            },
            guestLogin(){
                var _this = this
                axios.post(this.$serverURL + '/guest/login')
                    .then(function (response) {
                        response = response.data;
                        
                        if(response.success){
                            _this.$store.dispatch('setToken', response.userInfo.token)
                            _this.$store.dispatch('setRole', response.userInfo.role)
                            // console.log(response);
                            _this.$router.push('/');
                        }else if(response.error){
                            _this.showAlert(response.error);
                            // console.log(response.error);
                        }
                    })
            },
            showAlert(msg){
                swal({
                    text: msg,
                    type: "warning",
                    confirmButtonText: "确认",
                    heightAuto: false
                })
            },
            update(){
                this.elapsedTime -= 1;
                if(!this.elapsedTime){
                    clearInterval(this.timerID);
                    this.timerID = null;
                    this.elapsedTime = 0;
                }
            },
            passwordIsValid (password) {
                var regex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
                return regex.test(password);
            }
        }
    }
</script>
<style>
    .auth-form .tab-header{
        display: flex;
    }
    .auth-form .tab-item{
        width: 50%;
        border-bottom: 1px solid #EBEBEB;
        padding: 8px 0px;
        cursor: pointer;
    }
    .auth-form .tab-item.active{
        border-bottom: 1px solid #5C99E1;
        color: #5C99E1;
    }
    .auth-form .user-input{
        padding: 12px 0px;
        margin: 0px;
        border-bottom: 1px solid #EBEBEB;
        line-height: 32px;
    }
    .auth-form .user-input input{
        padding: 0px;
        background-color: transparent;
        border-style: none;
        font-size: 14px;
        
    }
    .cursor-pointer{
        cursor: pointer;
    }
    
</style>



