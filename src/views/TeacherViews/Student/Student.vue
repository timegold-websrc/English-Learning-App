<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18 align-items-center">
                <div class="flex-row mr-auto fn-muted">学生</div>
            </div>
            <div class="row mr-0 ml-0 fn-20 text-center">
                <div class="col-md-4 bordered_tab_item fn-muted" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">全部</div>
                <div class="col-md-4 bordered_tab_item fn-muted" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">已审核</div>
                <div class="col-md-4 bordered_tab_item fn-muted" :class="selectedTabID == 2 ? 'active' : ''" @click="selectTab(2)">未审核</div>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">姓名</th>
                        <th  class="fn-18 fn-black fn-bold-none">申请班级</th>
                        <th  class="fn-18 fn-black fn-bold-none">电话号码</th>
                        <th  class="fn-18 fn-black fn-bold-none">监护人</th>
                        <th  class="fn-18 fn-black fn-bold-none">课程学习情况</th>
                        <th  class="fn-18 fn-black fn-bold-none">学生信息</th>
                        <th  class="fn-18 fn-black fn-bold-none">状态</th>
                        <th  class="fn-18 fn-black fn-bold-none" style="min-width: 129px">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td>{{item.name}}</td>

                        <td v-if="item.class">{{item.class.name}}</td>
                        <td v-else class="fn-info cursor-pointer" @click="openModal(index)">分配班级</td>

                        <td>{{item.phone}}</td>
                        <td>{{item.guardian}}</td>
                        <td>
                            <button v-if="item.status" class="btn btn_primary btn-sm" @click="viewStudentResults(index)">查看</button>
                            <button v-else class="btn btn-outline-secondary btn-sm">查看</button>                        </td>
                        <td><button class="btn btn_primary btn-sm" @click="viewStudentInfo(index)">详情</button></td>
                        <td>
                            <div v-if="item.status">已审核</div>
                            <div v-else>未审核</div>
                        </td>
                        <td>
                            <div v-if="!item.status">
                                <button class="btn btn_primary btn-sm mr-2" @click="addStudentToClass(index)">通过</button>
                                <button class="btn btn_danger btn-sm" @click="removeStudentFromClass(item.id)">拒绝</button>
                            </div>
                            <div v-else><button class="btn btn_warning btn-sm" @click="moveOfOut(index)">移出班级</button></div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="sortList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>

        <b-modal
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">

            <div v-if="selectedStudent" class="modal_body fn-16">
                <div class="text-center">您确定将"<span>{{selectedStudent.name}}</span>"移出"<span>{{selectedStudent.class.name}}</span>"吗?</div>
                <div class="d-flex flex-center mt-3">
                    <button type="button" class="btn btn_primary mr-4 fn-14" style="box-shadow: unset" @click="removeStudentFromClass(selectedStudent.id)">确定</button>
                    <button type="button" class="btn btn-outline-primary ml-4 fn-14"  style="box-shadow: unset" @click="isModal = false">取消</button>
                </div>
            </div>
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import CustomSelect from '@/components/Common/CustomSelect'
    export default {
        components: {
            CustomSelect
        },
        data () {
            return {
                studentList: [],
                sortList: [],
                currentPage: 0,
                tmpData: [],
                selectedTabID: 0,

                isModal: false,
                selectedStudent: null
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.initStudentData();
        },
        methods: {
            initStudentData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/students', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.studentList = response.data;
                        _this.sortList = _this.studentList;
                        console.log(response.data);
                        _this.fliterPageData();
                    })
            },
            selectTab(index){
                if(this.selectedTabID == index) return;

                this.selectedTabID = index;
                this.currentPage = 1;
                this.fliterPageData();
            },
            fliterPageData(){
                if(this.selectedTabID == 0) this.sortList = this.studentList;
                else{
                    this.sortList = [];
                    for(var i in this.studentList){
                        var _student = this.studentList[i];
                        if(this.selectedTabID == 1 && _student.status) this.sortList.push(_student);
                        if(this.selectedTabID == 2 && !_student.status) this.sortList.push(_student);
                    }
                }
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.sortList.slice(offset, offset + 10);
            },
            addStudentToClass(index){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/teachers/acceptEntryRequestion/' + this.tmpData[index].id, {}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.initStudentData();
                    })
            },
            removeStudentFromClass(std_id){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/teachers/rejectEntryRequestion/' + std_id, {}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        if(_this.isModal) _this.isModal = false;
                        _this.initStudentData();
                    })
            },
            viewStudentInfo(index){
                this.$router.push({path:'/teacher/student/student_info', query: {path: ['学生'], id: this.tmpData[index].id}});
            },
            viewStudentResults(index){
                this.$router.push({path:'/teacher/student/course_results', query: {id: this.tmpData[index].id, name: this.tmpData[index].name, avatar: this.tmpData[index].avatar_url}});
            },
            moveOfOut(index){
                this.selectedStudent = this.tmpData[index];
                this.isModal = true;
            }
        }
    }
</script>
<style>
    .bordered_tab_item{
        line-height: 46px;
        border: 1px solid #F0F0F0;
        border-bottom: 0px;
        cursor: pointer;
    }
    .bordered_tab_item.active{
        background-color: #5C99E1;
        border: 1px solid #5C99E1;
        color: white!important;
    }
</style>
