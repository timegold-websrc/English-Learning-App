<template>
    <ContentWrapper>
        <div class="card p-4 ml-2 mr-2 mt-4">
            <div class="fn-16 mb-4">
                <router-link to="/settings" class="link-primary ml-1">个人中心</router-link> > 
                <span>修改密码</span> 
            </div>
            
            <div class="fn-16">
                <div class="mt-4">当前密码：
                    <input type="password" class="border_b_1_muted fn-12" style="min-width: 200px" v-model="oldPass">
                </div>
                <div class="mt-4 d-flex align-items-center">新<span class="space-9"></span>密<span class="space-6"></span>码：
                    <input type="password" class="border_none fn-12 ml-1"  style="min-width: 200px"
                        :class="errors.includes('new') ? 'err-border' :'border_b_1_muted'"  v-model="newPass" placeholder="6-8位至少含数字/字母2种组合">
                </div>
                <div class="mt-4">确认密码：
                    <input type="password" class="border_none fn-12"  style="min-width: 200px"
                        :class="errors.includes('confirm') ? 'err-border' :'border_b_1_muted'" v-model="confirm"  placeholder="6-8位至少含数字/字母2种组合">
                </div>
                <button type="button" class="btn btn-primary fn-16 mt-5 pr-5 pl-5 ml-5" style="box-shadow: unset" @click="resetPassword">保存</button>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    export default {
        data () {
            return {
                oldPass: '',
                newPass: '',
                confirm: '',

                errors: []
            }
        },
        watch: {
            newPass: function(val) { this.errors = []; },
            confirm: function(val) { this.errors = []; },
        },
        mounted() {
            
        },
        methods: {
            resetPassword(){
                if(!this.newPass) this.errors.push('new');
                if(this.newPass != this.confirm) this.errors.push('confirm');
                
                if(this.errors.length) return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/student/change_password', {old_pass: this.oldPass, new_pass: this.newPass}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        _this.oldPass = '';
                        _this.newPass = '';
                        _this.confirm = '';
                    })
            }
        }
    }
</script>
