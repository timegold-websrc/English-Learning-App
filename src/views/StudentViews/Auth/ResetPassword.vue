<template>
    <div class="auth-wrapper" :style="'height: ' + windowHeight + 'px'">
        <div  class="auth-form text-center">
            <div class="row mr-4 ml-4 mb-4 fn-black">
                <div class="col-2 pl-0 pr-2 text-right"><img src="img/icons/logo.png" class="icon-standard"></div> 
                <div class="col-5 pl-0 pr-0 fn-28 fn-bold text-left">iTeacher</div> 
                <div v-if="resetStatus" class="col-5 pl-0 pr-0 fn-24 border-left-info">重置密码</div> 
                <div v-else class="col-5 pl-0 pr-0 fn-24 border-left-info">短信验证</div> 
            </div>
            <div v-if="resetStatus">
                <div class="user-input row">
                    <div v-if="newpassword_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{newpassword_err}}</div>
                    <div class="col-1 pl-0 pr-0"><img src="img/icons/lock.png" class="form-icon"></div> 
                    <div class="col-11 pl-0 pr-0"><input class="width-full" v-model="newPassword" type="password" placeholder="请输入密码，6-8位至少含数字/字母2种组合"></div> 
                </div>

                <div class="user-input row">
                    <div v-if="password_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{password_err}}</div>
                    <div class="col-1 pl-0 pr-0"><img src="img/icons/check_lock.png" class="form-icon"></div> 
                    <div class="col-10 pl-0 pr-0"><input class="width-full" v-model="password" type="password" placeholder="再次输入新密码"></div> 
                    <div class="col-1 pl-0 pr-0 cursor-pointer"><img src="img/icons/clear.png" class="form-icon" @click="password = ''"></div>  
                </div>
                
                <div class="mt-5">
                    <button type="button" @click="resetPassword" class="btn btn-oval btn-primary width-full fn-20">确定</button>
                </div>
            </div>
            <div v-else>
                <div class="user-input row">
                    <div v-if="phone_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{phone_err}}</div>
                    <div class="col-1 pl-0 pr-0"><img src="img/icons/phone.png" class="form-icon"></div>
                    <div class="col-11 pl-0 pr-0"><input v-model="phone" class="width-full" type="text" placeholder="请输入手机号"></div> 
                </div>

                <div class="user-input row">
                    <div v-if="code_err" class="col-12 fn-warning text-left err-input"><em class="icon-info mr-2"></em>{{code_err}}</div>
                    <div class="col-1 pl-0 pr-0"><img src="img/icons/code.png" class="form-icon"></div> 
                    <div class="col-8 pl-0 pr-0"><input class="width-full" v-model="code" type="text" placeholder="请输入验证码"></div> 
                    <div class="col-3 pl-0 pr-0">
                        <div v-if="elapsedTime" class="border_1_muted radius_4 fn-12">请等待{{elapsedTime}}s</div>
                        <button v-else type="button" 
                            class="btn btn-outline-primary width-full fn-11 pr-2 pl-2 pt-1 pb-1"
                            @click="getCode">
                            获取验证码</button>
                    </div> 
                </div>
                
                <router-link to="/resetpassword" class="mt-5" style="display: block">
                    <button type="button" @click="smsVerification" class="btn btn-oval btn-primary width-full fn-20">下一步</button>
                </router-link>
            </div>
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
                resetStatus: false,
                phone: '',
                code: '',
                password: '',
                newPassword: '',

                phone_err: null,
                code_err: null,
                password_err: null,
                newpassword_err: null,

                timerID: null,
                elapsedTime: 0
            }
        },
        watch: {
            phone: function(val){ this.phone_err = null },
            code: function(val){ this.code_err = null },
            password: function(val){ this.password_err = null },
            newPassword: function(val){ this.newpassword_err = null }
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
            getCode(){
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
            smsVerification(){
                if(!this.phone) this.phone_err = '密码为空. 请输入密码.';
                else if(this.phone.length != 11) this.phone_err = '手机号码不正确. 请输入11位数字.';
                if(!this.code) this.code_err = '验证码为空. 请输入验证码.';

                if(this.phone_err || this.code_err) return;

                var _this = this;
                axios.post(this.$serverURL + '/verify_sms', {phone: this.phone, code: this.code})
                    .then(function (response) {
                        response = response.data;
                        // console.log(response)
                        if(response.success){
                            _this.resetStatus = true;
                        }else if(response.error){
                            if(response.error.type == 'phone') _this.phone_err = response.error.msg;
                            else if(response.error.type == 'code') _this.code_err = response.error.msg;
                            else _this.showAlert(response.error);
                        }
                    })
            },
            resetPassword(){
                if(!this.phone) this.phone_err = '入手机号码为空. 请输入手机号码.';
                else if(this.phone.length != 11) this.phone_err = '手机号码不正确. 请输入11位数字.';
                if(!this.password) this.password_err = '密码为空. 请输入密码.';
                if(!this.newPassword) this.newpassword_err = '新密码为空. 请输入新密码.';

                if(this.phone_err || this.password_err || this.newpassword_err) return;
                if(this.newPassword.length < 6 || this.newPassword.length > 8) {this.newpassword_err = '密码不正确. 请输入6-8位至少含数字/字母2种组合.'; return;}
                if(!this.passwordIsValid(this.newPassword)) {this.newPassword_err = '密码不正确. 请输入6-8位至少含数字/字母2种组合.'; return}
                if(this.password != this.newPassword) { this.password_err = '密码和新密码不相等.';   return; }

                var encodePass = md5(this.password);
                var encodeNewPass = md5(this.newPassword);
                var _this = this;
                axios.post(this.$serverURL + '/student/reset_password', {phone: this.phone, password: encodePass, newpassword: encodeNewPass})
                    .then(function (response) {
                        response = response.data;
                        // console.log(response)
                        if(response.success){
                            _this.$router.push('/login');
                        }else if(response.error){
                            if(response.error.type == 'phone') _this.phone_err = response.error.msg;
                            else if(response.error.type == 'password') _this.password_err = response.error.msg;
                            else if(response.error.type == 'newpassword') _this.newpassword_err = response.error.msg;
                            else _this.showAlert(response.error);

                            if(_this.phone_err) _this.resetStatus = false;
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
    .border-left-info{
        border-left: 2px solid #5C99E1;
    }
</style>



