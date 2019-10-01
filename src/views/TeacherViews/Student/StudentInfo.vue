<template>
    <ContentWrapper>
        <div  v-if="student_info" class="card m-0 p-4">
            <div class="card-header d-flex fn-18 mb-5" style="line-height: 41px">
                <div v-if="paths.length" class="flex-row mr-auto">
                    <span v-for="(path, index) in paths" :key="index" @click="$router.go(index - paths.length)" class="link-primary cursor-pointer">{{path}} > </span> 
                    <span class="cursor-pointer">{{student_info ? student_info.name : ''}}</span>
                </div>
                <button v-if="!isEditable" type="button" class="fn-18 flex-row btn btn-outline-primary" @click="editStudentInfo">编辑信息</button>
            </div>
            <div class="d-flex flex-center mt-5 mb-4">
                <div @click="uploadAvatar">
                    <avatar username="" :size="108" :src="user_photo"/>
                </div>
                <input ref="avatarUpload" type="file" hidden @change="changedOnFile">
            </div>
            <div v-if="isEditable" class="d-flex flex-center fn-18 fn-black mb-5">
                <div class="mr-5">
                    <div class="mt-3 d-flex align-items-center">姓<span class="space-36"></span>名：
                        <input type="text" class="border_b_1_muted width-200" v-model="newStdInfo.name">
                    </div>
                    <div class="mt-4 d-flex">性<span class="space-36"></span>别：
                        <label class="c-radio d-flex align-items-center mr-4">
                            <input ref="isMale" type="radio" name="i-radio" :checked="newStdInfo.sex == 'male' ? true : false" @click="changeSex('male')"/>
                            <span class="fa fa-check"></span> 男</label>
                        <label class="c-radio d-flex align-items-center">
                            <input type="radio" name="i-radio"  :checked="newStdInfo.sex == 'female' ? true : false"  @click="changeSex('female')"/>
                            <span class="fa fa-check"></span> 女</label>
                    </div>
                    <div class="mt-3 d-flex align-items-center">监<span class="space-9"></span>护<span class="space-6"></span>人：
                        <input type="text" class="border_b_1_muted" v-model="newStdInfo.guardian">
                    </div>
                </div>
                <div class="ml-5">
                    <div class="mt-4 text-muted">班<span class="space-36"></span>级：{{student_info && student_info.class? student_info.class.name : ''}}</div>
                    <div class="mt-4 text-muted">电<span class="space-36"></span>话：{{student_info ? student_info.phone : ''}}</div>
                    <div class="mt-4 text-muted">入学日期：{{student_info ? student_info.entry_date : ''}}</div>
                    <!-- <div class="mt-4 d-flex align-items-center">班<span class="space-36"></span>级：
                        <div class="width-200">
                            <custom-select
                                class="fn-14 border_b_1_muted"
                                bordered='none'
                                placeholdText=" - 选择课程 - "
                                :menus="classList"
                                :value="selectedClassItem"
                                @changeSelection="changedClass"/>
                        </div>
                    </div>
                    <div class="mt-4 d-flex align-items-center">电<span class="space-36"></span>话：
                        <input type="text" class="border_b_1_muted width-200" v-model="newStdInfo.phone">
                    </div>
                    <div class="mt-4 d-flex align-items-center">入学日期：
                        <input type="text" class="border_b_1_muted" v-model="newStdInfo.entry_date">
                    </div> -->
                </div>
            </div>
            <div v-else class="d-flex flex-center fn-18 fn-black mb-5">
                <div class="mr-5">
                    <div class="mt-4">姓<span class="space-36"></span>名：{{student_info ? student_info.name : ''}}</div>
                    <div class="mt-4">性<span class="space-36"></span>别：{{user_sex}}</div>
                    <div class="mt-4">监<span class="space-9"></span>护<span class="space-6"></span>人：{{student_info ? student_info.guardian : ''}}</div>
                    
                </div>
                <div class="ml-5">
                    <div class="mt-4">班<span class="space-36"></span>级：{{student_info && student_info.class? student_info.class.name : ''}}</div>
                    <div class="mt-4">电<span class="space-36"></span>话：{{student_info ? student_info.phone : ''}}</div>
                    <div class="mt-4">入学日期：{{student_info ? student_info.entry_date : ''}}</div>
                </div>
            </div>

            <div v-if="isEditable" class="d-flex flex-center mt-5 fn-14">
                <button type="button" class="flex-row btn btn-primary mr-4" @click="setStudentInfo">确定</button>
                <button type="button" class="flex-row btn btn-outline-danger ml-4" @click="closeEditor">取消</button>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
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
                student_info: null,
                isEditable: false,
                // classList: [],

                errors: [],
                newStdInfo: null,
                newAvatar_file: null,
                newAvatar_url: '',
                // selectedClassItem: null,
                paths: []
            }
        },
        computed: {
            user_photo: function(){
                if(this.newAvatar_url) return this.newAvatar_url;
                else if(this.student_info && this.student_info.avatar_url) return this.$serverURL + this.student_info.avatar_url;
                else return '/img/user/dummy_user.png'
            },
            user_sex: function(){
                if(!this.student_info || !this.student_info.sex) return '';
                else if(this.student_info.sex == 'male') return '男';
                else return '女';
            },
            isMale: function(){
                this.newStdInfo.sex = this.$refs.isMale.checked ? 'male' : 'female';
                if(this.newStdInfo.sex == 'male') return true;
                else return false;
            }
        },
        mounted() {
            this.studentID = this.$route.query.id;
            this.paths = this.$route.query.path;

            if(!this.studentID) this.$router.push('/teacher/student');

            this.initStudentInfo();
        },
        methods: {
            initStudentInfo(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/studentInfo/' + this.studentID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.student_info = response.data;
                        console.log(_this.student_info);
                    })
            },
            viewResult(index){
                this.$router.push({path:'/teacher/homework/student_results/result', query: {id: this.tmpData[index].id}});
            },
            editStudentInfo(){
                if(!this.student_info) return;
                this.newStdInfo = {
                    name: this.student_info.name,
                    sex: this.student_info.sex,
                    // entry_date: this.student_info.entry_date,
                    guardian: this.student_info.guardian,
                    // phone: this.student_info.phone,
                    // class_id: this.student_info.class ? this.student_info.class.id : 0
                };

                this.isEditable = true;
                // if(!this.classList.length){
                //     var _this = this;
                //     var token = this.$store.getters.getToken;
                //     axios.get(this.$serverURL + '/api/teachers/classes', {headers: {'authorization': `${token}`}})
                //         .then(function (response) {
                //             if(response.data.error){
                //                 if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                //                 console.log(response.data.error);
                //                 return;
                //             }
                //             _this.classList = response.data;
                //             _this.setClass();
                //         })
                // }else this.setClass();
            },
            closeEditor(){
                this.newStdInfo = null;
                this.newAvatar_file = null;
                this.newAvatar_url = '';
                // this.selectedClassItem = null;
                this.isEditable = false;
            },
            // changedClass(item){
            //     this.selectedClassItem = item;
            // },
            // setClass(){
            //     if(!this.student_info.class) return;
            //     for(var index in this.classList){
            //         if(this.classList[index].id == this.student_info.class.id) {
            //             this.selectedClassItem = this.classList[index]
            //             break;
            //         }
            //     }
            // },
            changeSex(val){
                this.newStdInfo.sex = val;
                console.log(val);
            },
            setStudentInfo(){
                // if(this.selectedClassItem) this.newStdInfo.class_id = this.selectedClassItem.id;
                // else{
                //     if(this.student_info.class) this.newStdInfo.class_id = this.student_info.class.id;
                //     else this.newStdInfo.class_id = null;
                // }
                
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/teachers/resetStudentInfo/' + this.studentID, {student_info: this.newStdInfo}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.closeEditor();
                        _this.initStudentInfo();
                    })
            },
            uploadAvatar(){
                return;
                if(!this.isEditable) return;
                this.$refs.avatarUpload.click();
            },
            changedOnFile(e){
                var files = e.target.files || e.dataTransfer.files
                if (!files.length) return
                
                this.newAvatar_file = files[0];
                var reader = new FileReader()
                var _this = this
                reader.onload = (e) => {
                    _this.newAvatar_url = e.target.result
                }
                reader.readAsDataURL(this.newAvatar_file)
            }
        }
    }
</script>
<style>
    .width-200{
        width: 200px;
    }
</style>
