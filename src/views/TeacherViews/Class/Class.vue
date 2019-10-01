<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">班级</div>
                <button type="button" class="flex-row btn btn-outline-primary" @click="clickedAddBtn">添加班级</button>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">年级</th>
                        <th  class="fn-18 fn-black fn-bold-none">班级名称</th>
                        <th  class="fn-18 fn-black fn-bold-none">班主任</th>
                        <th  class="fn-18 fn-black fn-bold-none">开班时间</th>
                        <th  class="fn-18 fn-black fn-bold-none">人数</th>
                        <th  class="fn-18 fn-black fn-bold-none">班级邀请码</th>
                        <th  class="fn-18 fn-black fn-bold-none" style="min-width: 90px">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td>{{getGradeName(item.grade_id)}}</td>
                        <td class="cursor-pointer" @click="gotoDetail(index)">{{item.name}}</td>
                        <td>{{item.teacher_name}}</td>
                        <td>{{item.open_date}}</td>
                        <td>{{item.std_count}}</td>
                        <td>{{item.invite_code}}</td>
                        <td>
                            <img src="img/icons/edit_active.png" alt="" @click="clickedEditBtn(index)" class="mr-3 cursor-pointer">
                            <img src="img/icons/trash_active.png" alt="" @click="deleteClass(index)" class="cursor-pointer">
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="classes.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>


        <b-modal id="modal-center" 
            centered title="BootstrapVue" 
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">
            <div class="modal_body fn-16">
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">年<span class="space-32"></span>级：</div>
                    <div style="width: 220px">
                        <custom-select
                            class="fn-14 modal_select"
                            :class="errors.includes('grade') ? 'err-border' : ''"
                            bordered='none'
                            placeholdText=" - 选择课程 - "
                            :menus="grades"
                            :value="selectedGrade"
                            @changeSelection="changedGrade"/>
                    </div>
                </div>
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">班级名称：</div>
                    <div style="width: 220px">
                        <input v-model="className" class="width-full modal_input" :class="errors.includes('class') ? 'err-border' : ''" type="text" placeholder="请输入班级名称">
                    </div>
                </div>
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">班<span class="space-6"></span>主<span class="space-6"></span>任：</div>
                    <div style="width: 220px">
                        <input v-model="teacherName" class="width-full modal_input" :class="errors.includes('teacher') ? 'err-border' : ''" type="text" placeholder="">
                    </div>
                </div>
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">开班时间：</div>
                    <div style="width: 220px" class="d-flex align-items-center modal_input pl-3">
                        <datetime 
                            type="datetime"
                            v-model="datetime"
                            :inputStyle="{border: 'none', width: '190px', cursor: 'pointer', background: 'transparent'}"
                            format="yyyy/MM/dd"
                            style="z-index: 10"></datetime>
                        <img src="img/icons/calendar.png" class="icon-small" alt="" style="z-index: 0; margin-left: -20px">
                    </div>
                </div>
                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="addClass">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeModal">取消</button>
                    </div>
                </div>
            </div>
            
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import swal from 'sweetalert2'
    import axios from 'axios';
    import CustomSelect from '@/components/Common/CustomSelect'
    import Datetime from '@/components/DateTime/Datetime'
    export default {
        components: {
            CustomSelect,
            Datetime
        },
        data () {
            return {
                isModal: false,
                selectedGrade: null,
                className: '',
                teacherName: '',
                datetime: '',
                modalState: '',
                selectedClass: null,

                grades: [],
                classes: [],
                currentPage: 0,
                tmpData: [],
                errors: []
            }
        },
        watch: {
            currentPage: function(val){ this.fliterPageData(); },
            teacherName: function(val) { this.errors = [];  },
            selectedGrade: function(val){ this.errors = []; },
            className: function(val){ this.errors = []; }
        },
        mounted() {
            this.initClassData();
            this.initGrades();
        },
        methods: {
            initClassData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/classes', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        console.log(response.data);
                        _this.classes = response.data;
                        _this.fliterPageData();
                    })
            },
            initGrades(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/grades', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.grades = response.data;
                    })
            },
            clickedAddBtn(){
                this.modalState = 'create';
                var d = new Date();
                this.datetime = d.toISOString();
                this.teacherName = this.$store.getters.getUserName;
                this.isModal = true;
            },
            clickedEditBtn(index){
                this.modalState = 'edit';
                this.selectedClass = this.tmpData[index];
                this.className = this.selectedClass.name;
                this.datetime = new Date(this.selectedClass.open_date).toISOString();
                this.teacherName = this.selectedClass.teacher_name;
                this.setGrade(this.selectedClass.grade_id);
                this.isModal = true;
            },
            closeModal(){
                this.selectedGrade = null;
                this.className = '';
                this.teacherName = '';
                this.datetime = '';
                this.modalState = '';
                this.selectedClass = null,
                this.isModal = false;
            },
            addClass(){
                if(!this.selectedGrade) this.errors.push('grade');
                if(!this.teacherName) this.errors.push('teacher');
                if(!this.className.trim()) this.errors.push('class');

                if(this.errors.length) return;

                var classData = {
                    name: this.className,
                    teacher_name: this.teacherName,
                    open_date: this.datetime.substr(0, 10),
                    grade_id: this.selectedGrade.id,
                    members: 0
                }
                // console.log(classData.open_date);
                var _this = this;
                var token = this.$store.getters.getToken;
                if(this.modalState == 'create'){
                    axios.post(this.$serverURL + '/api/teachers/createClass', {class_info: classData}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.initClassData();
                        _this.closeModal();
                    })
                }else{
                    axios.put(this.$serverURL + '/api/teachers/resetClassInfo/' + this.selectedClass.id, {class_info: classData}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.initClassData();
                        _this.closeModal();
                    })
                }
            },
            deleteClass(index){
                var _class = this.tmpData[index];
                if(Number(_class.std_count)) {return this.showAlert('班里有学生， 无法删除.')}

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.delete(this.$serverURL + '/api/teachers/deleteClass/' + _class.id, {headers: {'authorization': `${token}`}})
                .then(function (response) {
                    if(response.data.error){
                        if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                        console.log(response.data.error);
                        return;
                    }
                    _this.initClassData();
                })
            },
            changedGrade(item){
                this.selectedGrade = item;
            },
            getGradeName(gid){
                if(!this.grades.length) return '';
                for(var index in this.grades){
                    if(this.grades[index].id == gid) return this.grades[index].name;
                }
            },
            setGrade(gradeId){
                for(var index in this.grades){
                    if(this.grades[index].id == gradeId) {
                        this.selectedGrade = this.grades[index];
                        break;
                    }
                }
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.classes.slice(offset, offset + 10);
            },
            gotoDetail(index){
                var _class = this.tmpData[index];
                this.$router.push({path: '/teacher/class/detail', query: {id: _class.id, name: _class.name}});
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
