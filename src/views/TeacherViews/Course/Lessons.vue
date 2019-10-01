<template>
    <ContentWrapper>
        <div class="card p-4 m-0">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/course" class="link-primary">总课程</router-link> > 
                    <router-link v-if="pathInfo" 
                        :to="{path: '/teacher/course/units', query: {course_id: pathInfo.course_id, course_name: pathInfo.course_name}}"
                        class="link-primary">{{pathInfo.course_name}}</router-link> > 
                    <span v-if="pathInfo" class="cursor-pointer">{{pathInfo.unit_name}}</span> 
                </div>
                <button v-if="isPublished" type="button" class="fn-muted flex-row btn btn-outline-secondary">添加课时</button>
                <button v-else type="button" class="flex-row btn btn-outline-primary" @click="isModal = true">添加课时</button>
            </div>
            <div class="search_rounded fn-16 mb-4 mt-2">
                <input type="text" placeholder="课时搜索" v-model="keyWord">
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">课时名称</th>
                        <th  class="fn-18 fn-black fn-bold-none th-30-60">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="cursor-pointer link-primary" @click="viewSentences(index)">{{item.name}}</td>
                        <td>
                            <em v-if="isPublished" class="fn-muted fn-24 mr-2 far fa-trash-alt cursor-pointer"></em>
                            <em v-else class="fn-danger fn-24 mr-2 far fa-trash-alt cursor-pointer" @click="checkDelete(index)"></em>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="sortList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>


        <b-modal id="modal-center" 
            centered title="BootstrapVue" 
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">

            <div class="modal_body">
                
                <div class="d-flex fn-16 mb-4">
                    <div style="width: 80px">课时名称：</div>
                    <div style="width: 200px"><input class="modal_input" :class="errors.includes('name') ? 'err-border': ''" type="text" v-model="newLessonName"></div>
                </div>

                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="createNewLesson">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeModal">取消</button>
                    </div>
                </div>
            </div>
        </b-modal>

        <b-modal id="deleteModal"
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isDelModal">

            <div class="modal_body fn-16">
                <div class="text-center">里面含有数据. 确认要删除?</div>
                <div class="text-center mt-2">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="deleteLesson">确认</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="selectedUnitIndex = -1; isDelModal = false">取消</button>
                    </div>
                </div>
            </div>
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import ImageViewer from '@/components/Common/ImageViewer'
    export default {
        components: {
            ImageViewer
        },
        data () {
            return {
                isPublished: false,
                isModal: false,
                newLessonName: '',
                errors: [],

                pathInfo: null,
                lessonList: [],
                currentPage: 0,
                tmpData: [],
                keyWord: '',
                sortList: [],

                selectedLessonIndex: -1,
                isDelModal: false
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            },
            keyWord: function(val){
                this.sortLesson(val);
            }
        },
        mounted() {
            this.pathInfo = this.$route.query;
            if(!this.pathInfo || !this.pathInfo.course_id || !this.pathInfo.course_name || !this.pathInfo.unit_id || !this.pathInfo.unit_name) {
                this.$router.push('/teacher/course');
            }

            this.initLessonData();
        },
        methods: {
            initLessonData(){
                this.selectedLessonIndex = -1;
                if(!this.pathInfo) return;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/lessons/'+ this.pathInfo.unit_id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        console.log(response.data);
                        _this.isPublished = response.data.ispublished ? true : false;
                        _this.lessonList = response.data.lessons;
                        _this.sortList = _this.lessonList;
                        _this.fliterPageData();
                    })
            },
            createNewLesson(){
                if(!this.newLessonName.trim()) {this.errors.push('name'); return;}
                if(!this.pathInfo) return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/teachers/lesson/' + this.pathInfo.course_id + '/' + this.pathInfo.unit_id, {name: this.newLessonName}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initLessonData();
                        _this.closeModal();
                    })
            },
            closeModal(){
                this.newLessonName = '';
                this.errors = [];
                this.isModal = false;
            },
            checkDelete(index){
                this.selectedLessonIndex = index;
                if(!this.tmpData[index].sentences.length) this.deleteLesson();
                else this.isDelModal = true;
            },
            deleteLesson(){
                var delID = this.tmpData[this.selectedLessonIndex].id;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.delete(this.$serverURL + '/api/teachers/lesson/' + delID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.initLessonData();
                        _this.isDelModal = false;
                    })
            },
            viewSentences(index){
                this.$router.push({path: '/teacher/course/sentences', query: {
                    course_id: this.pathInfo.course_id,
                    course_name: this.pathInfo.course_name,
                    unit_id: this.pathInfo.unit_id,
                    unit_name: this.pathInfo.unit_name,
                    lesson_id: this.tmpData[index].id,
                    lesson_name: this.tmpData[index].name
                }});
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                
                this.tmpData = this.sortList.slice(offset, offset + 10);
            },
            sortLesson(key){
                if(!key) this.sortList = this.lessonList;
                else{
                    var sortedArray = [];
                    for(var i = 0; i < this.lessonList.length; i++){
                        if(this.lessonList[i].name.includes(key)) sortedArray.push(this.lessonList[i]);
                    }
                    this.sortList = sortedArray;
                }
                this.fliterPageData();
            }
        }
    }
</script>
<style>
    .search_rounded{
        background: url(/img/icons/search.png) no-repeat left 1rem center/14px 14px;
        border: 1px solid grey;
        border-radius: 100px;
        padding: 5px 0px;
    }
    .search_rounded input{
        margin-left: 40px;
        border: 0px;
    }
</style>
