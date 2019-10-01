<template>
    <ContentWrapper>
        <div  v-if="teacher_nfo" class="card m-0 p-4">
            <div class="card-header d-flex fn-18 mb-5" style="line-height: 41px">
                <button v-if="!isEditable" type="button" class="fn-18 flex-row btn btn-outline-primary" @click="editTeacherinfo">编辑信息</button>
            </div>
            <div class="d-flex flex-center mt-5 mb-4">
                <div @click="uploadAvatar">
                    <avatar username="" :size="108" :src="user_photo"/>
                </div>
                <input ref="avatarUpload" type="file" hidden @change="changedOnFile">
            </div>
            <div v-if="isEditable" class="d-flex flex-center fn-18 fn-black mb-5">
                <div class="">
                    <div class="mt-4 d-flex align-items-center">姓<span class="space-36"></span>名：
                        <input type="text" class="border_none width-200" :class="errors.includes('name') ? 'err-border' : 'border_b_1_muted'" v-model="newTeachername">
                    </div>
                    <div class="mt-4 text-muted">电<span class="space-36"></span>话：{{teacher_nfo ? teacher_nfo.phone : ''}}</div>
                    <!-- <div class="mt-4 d-flex align-items-center">电<span class="space-36"></span>话：
                        <input type="text" class="border_none width-200"  :class="errors.includes('phone') ? 'err-border' : 'border_b_1_muted'" v-model="newTeacherphone">
                    </div> -->
                </div>
            </div>
            <div v-else class="d-flex flex-center fn-18 fn-black mb-5">
                <div>
                    <div class="mt-4">姓<span class="space-36"></span>名：{{teacher_nfo ? teacher_nfo.name : ''}}</div>
                    <div class="mt-4">电<span class="space-36"></span>话：{{teacher_nfo ? teacher_nfo.phone : ''}}</div>
                </div>
            </div>

            <div v-if="isEditable" class="d-flex flex-center mt-4 fn-14">
                <button type="button" class="flex-row btn btn-primary mr-4" @click="updateTeacherInfo">确定</button>
                <button type="button" class="flex-row btn btn-outline-danger ml-4" @click="closeEditor">取消</button>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import swal from 'sweetalert2'
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    import CustomSelect from '@/components/Common/CustomSelect'
    export default {
        components: {
            CustomSelect,
            Avatar
        },
        data () {
            return {
                studentID: null,
                teacher_nfo: null,
                isEditable: false,

                errors: [],
                newAvatar_file: null,
                newAvatar_url: '',
                newTeachername: '',
                newTeacherphone: ''
            }
        },
        watch: {
            newTeachername: function(val) {this.errors = []},
            newTeacherphone: function(val) {this.errors = []}
        },
        computed: {
            user_photo: function(){
                if(this.newAvatar_url) return this.newAvatar_url;
                else if(this.teacher_nfo && this.teacher_nfo.avatar_url) return this.$serverURL + this.teacher_nfo.avatar_url;
                else return '/img/user/dummy_user.png'
            }
        },
        mounted() {
            this.initTeacherInfo();
        },
        methods: {
            initTeacherInfo(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/getTeacherInfo', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.teacher_nfo = response.data;
                    })
            },
            editTeacherinfo(){
                if(!this.teacher_nfo) return;
                this.newTeachername = this.teacher_nfo.name;
                this.newTeacherphone = this.teacher_nfo.phone;

                this.isEditable = true;
            },
            closeEditor(){
                this.newTeachername = '';
                this.newTeacherphone = '';
                this.newAvatar_file = null;
                this.newAvatar_url = null;
                this.isEditable = false;
            },
            updateTeacherInfo(){
                if(!this.newTeachername) this.errors.push('name');
                // if(!this.newTeacherphone) this.errors.push('phone');

                if(this.errors.length) return;

                var data = new FormData();
                data.append('name', this.newTeachername);
                // data.append('phone', this.newTeacherphone);
                data.append('img_file', this.newAvatar_file);

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/teachers/updateTeacherInfo', data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.closeEditor();
                        _this.initTeacherInfo();
                    })
            },
            uploadAvatar(){
                if(!this.isEditable) return;
                this.$refs.avatarUpload.click();
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
<style>
    .width-200{
        width: 200px;
    }
</style>
