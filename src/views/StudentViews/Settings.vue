<template>
    <ContentWrapper>
        <div class="card p-4 ml-2 mr-2 mt-4">
            <div class="d-flex tab_header border_b_2_muted text-center ml-0 mr-0 mb-2">
                <div class="d-flex mr-auto fn-18">
                    <div class="tab_item" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">个人中心</div>
                    <div class="tab_item" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">我的班级</div>
                </div>
                <div>
                    <button type="button" class="btn btn-outline-primary fn-16 btn-sm mr-4" style="box-shadow: unset" @click="showPasswordPage">修改密码</button>
                    <button type="button" class="btn btn-outline-primary fn-16 btn-sm mr-4" style="box-shadow: unset" @click="logout">退出</button>
                </div>
            </div>
            
            <div v-if="selectedTabID == 0" class="mt-4">
                <button v-if="!isEditable" type="button" class="ml-4 fn-16 flex-row btn btn-primary btn-md"  style="box-shadow: unset" @click="editPersonInfo">编辑信息</button>
                <div class="d-flex flex-center mt-5 mb-4">
                    <div @click="uploadAvatar">
                        <avatar username="" :size="108" :src="user_photo"/>
                    </div>
                    <input ref="avatarUpload" type="file" hidden @change="changedOnFile">
                </div>
                <div class="d-flex flex-center fn-18 fn-black mb-5">
                    <div class="mr-5">
                        <div class="mt-4 d-flex align-items-center">姓<span class="space-36"></span>名：
                            <input v-if="isEditable" type="text" class="border_none width-200" :class="errors.includes('name') ? 'err-border' : 'border_b_1_muted '" v-model="newPersonInfo.name">
                            <span v-else>{{personal_info ? personal_info.name : ''}}</span>
                        </div>
                        <div class="mt-4 d-flex align-items-center">电<span class="space-36"></span>话：
                            <input v-if="isEditable" type="text" class="border_none width-200" :class="errors.includes('phone') ? 'err-border' : 'border_b_1_muted '" v-model="newPersonInfo.phone">
                            <span v-else>{{personal_info ? personal_info.phone : ''}}</span>
                        </div>
                        <div class="mt-4 d-flex align-items-center">监<span class="space-9"></span>护<span class="space-6"></span>人：
                            <input v-if="isEditable" type="text" class="border_b_1_muted" v-model="newPersonInfo.guardian">
                            <span v-else>{{personal_info ? personal_info.guardian : ''}}</span>
                        </div>
                    </div>
                    <div class="ml-5">
                        <div class="mt-4 d-flex">性<span class="space-36"></span>别：
                            <label v-if="isEditable" class="c-radio d-flex align-items-center mr-4">
                                <input ref="isMale" type="radio" name="i-radio" :checked="newPersonInfo.sex == 'male' ? true : false" @click="changeSex('male')"/>
                                <span class="fa fa-check"></span> 男</label>
                            <label v-if="isEditable" class="c-radio d-flex align-items-center">
                                <input type="radio" name="i-radio"  :checked="newPersonInfo.sex == 'female' ? true : false"  @click="changeSex('female')"/>
                                <span class="fa fa-check"></span> 女</label>

                            <span v-else>{{user_sex}}</span>
                        </div>

                        <div class="d-flex mt-4 align-items-center">班<span class="space-36"></span>级：
                            <span>{{personal_info && personal_info.class? personal_info.class.name : '未加入班级'}}</span>
                            <button v-if ="personal_info && !personal_info.class" type="button" class="btn btn-primary fn-14 btn-sm ml-3" style="box-shadow: unset" @click="isModal = true">加入班级</button>
                            <span v-else-if="personal_info && !personal_info.status" class="ml-3 fn-14 text-muted">审核中</span>
                        </div>
                        
                        <div class="mt-4">入学日期：{{personal_info ? personal_info.entry_date : ''}}</div>
                    </div>
                </div>

                <div v-if="isEditable" class="d-flex flex-center mt-5 fn-14">
                    <button type="button" class="flex-row btn btn-primary mr-4" @click="setPersonInfo">确定</button>
                    <button type="button" class="flex-row btn btn-outline-danger ml-4" @click="closeEditor">取消</button>
                </div>
            </div>

            <div v-else-if="class_info" class="fn-16">
                <div class="mt-3 mb-3">班级：{{class_info.name}}</div>
                <div class="d-flex align-items-center mb-3">我的老师：
                    <div class="text-center">
                        <avatar username="" :size="56" :src="class_info.teacher.avatar_url"/>
                        <div>{{class_info.teacher.name}}</div>
                    </div>
                </div>
                <div class="mb-2">
                    我的同学 ( <span>{{class_info.students.length}}人</span> ) :
                </div>
                <div class="d-flex flex-wrap">
                    <div v-for="(std, index) in class_info.students" :key="index" class="text-center mb-2 ml-2 mr-2">
                        <avatar username="" :size="56" :src="std.avatar_url"/>
                        <div>{{std.name}}</div>
                    </div>
                </div>
            </div>
        </div>


        <b-modal
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">

            <div class="modal_body fn-16">
                <div>请输入班级邀请码：</div>
                <div class="mt-1 mb-3">
                    <input ref="invitecode" class="width-full" type="text">
                </div>
                <div class="fn-12 text-muted">邀请码请咨询老师！</div>
                <div class="d-flex flex-center mt-3">
                    <button type="button" class="flex-row btn btn-primary mr-4 fn-14" style="box-shadow: unset" @click="sendEntryReq">确定</button>
                    <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14"  style="box-shadow: unset" @click="isModal = false">取消</button>
                </div>
            </div>
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import swal from 'sweetalert2'
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                selectedTabID: 0,
                class_info: null,
                personal_info: null,
                isEditable: false,

                errors: [],
                newPersonInfo: null,
                newAvatar_file: null,
                newAvatar_url: '',

                isModal: false
            }
        },
        mounted() {
            this.initPersonalData();
        },
        computed: {
            user_photo: function(){
                if(this.newAvatar_url) return this.newAvatar_url;
                else if(this.personal_info && this.personal_info.avatar_url) return this.$serverURL + this.personal_info.avatar_url;
                else return '/img/user/dummy_user.png'
            },
            user_sex: function(){
                if(!this.personal_info || !this.personal_info.sex) return '';
                else if(this.personal_info.sex == 'male') return '男';
                else return '女';
            },
            isMale: function(){
                this.newPersonInfo.sex = this.$refs.isMale.checked ? 'male' : 'female';
                if(this.newPersonInfo.sex == 'male') return true;
                else return false;
            }
        },
        methods: {
            initPersonalData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/personalInfo', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        _this.personal_info = resData;
                    })
            },
            initClassInfo(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/classInfo', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        resData.teacher.avatar_url = resData.teacher.avatar_url ? _this.$serverURL + resData.teacher.avatar_url : '/img/user/dummy_user.png';
                        var _students = [];
                        var _myInfo = null;
                        for(var i = 0; i < resData.students.length; i++){
                            var _std = resData.students[i];
                            _std.avatar_url = _std.avatar_url ? _this.$serverURL + _std.avatar_url : '/img/user/dummy_user.png';
                            if(_std.id == resData.myID) _myInfo = _std;
                            else _students.push(_std);
                        }
                        _myInfo.name = '我';
                        _students.unshift(_myInfo);
                        resData.students = _students;
                        _this.class_info = resData;
                    })
            },
            selectTab(index){
                if(this.selectedTabID == index) return;
                this.isEditable = false;
                this.selectedTabID = index;
                if(index == 0) this.initPersonalData();
                else if(this.personal_info.class) this.initClassInfo();
            },
            showPasswordPage(){
                console.log('sdfsf')
                this.$router.push('/reset_pass');
            },
            logout(){
                this.$router.push('/login');
            },
            editPersonInfo(){
                if(!this.personal_info) return;
                this.newPersonInfo = {
                    name: this.personal_info.name,
                    sex: this.personal_info.sex,
                    guardian: this.personal_info.guardian,
                    phone: this.personal_info.phone
                };

                this.isEditable = true;
            },
            uploadAvatar(){
                if(!this.isEditable) return;
                this.$refs.avatarUpload.click();
            },
            changeSex(val){
                this.newPersonInfo.sex = val;
            },
            changedOnFile(e){
                var files = e.target.files || e.dataTransfer.files
                if (!files.length) return
                if(files[0].type != 'image/jpeg') return this.showAlert('请选择jpg或jpeg格式的图像。');
                
                this.newAvatar_file = files[0];
                var reader = new FileReader()
                var _this = this
                reader.onload = (e) => {
                    _this.newAvatar_url = e.target.result
                }
                reader.readAsDataURL(this.newAvatar_file)
            },
            closeEditor(){
                this.newPersonInfo = null;
                this.newAvatar_file = null;
                this.newAvatar_url = '';
                this.errors = [];
                this.isEditable = false;
            },
            setPersonInfo(){
                this.errors = [];
                if(!this.newPersonInfo.name) this.errors.push('name');
                if(!this.newPersonInfo.phone) this.errors.push('phone');

                if(this.errors.length) return;

                var _data = new FormData();
                _data.append('name', this.newPersonInfo.name);
                _data.append('phone', this.newPersonInfo.phone);
                _data.append('sex', this.newPersonInfo.sex);
                _data.append('guardian', this.newPersonInfo.guardian);
                _data.append('img_file', this.newAvatar_file);

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/students/updatePersonalInfo', _data, {'Content-Type': 'multipart/form-data', headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.closeEditor();
                        _this.initPersonalData();
                    })
            },
            sendEntryReq(){
                var _code = this.$refs.invitecode.value;
                if(!_code) return;
                
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/student/requestEntryClass', {invite_code: _code}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        _this.personal_info.class = {name: resData.class};
                        _this.personal_info.status = resData.status;
                        _this.$store.dispatch('setToken', resData.token);

                        _this.isModal = false;
                    })
            },
            showAlert(msg){
                swal({
                    text: msg,
                    type: "warning",
                    confirmButtonText: "确认",
                    heightAuto: false
                })
            }
        }
    }
</script>
