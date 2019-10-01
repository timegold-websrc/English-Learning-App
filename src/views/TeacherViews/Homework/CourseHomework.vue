<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            
            <div class="card-header d-flex flex-space fn-16">
                <div>
                    <button type="button" class="btn btn-left" :class="type==0?'btn-primary':'btn-outline-primary'" @click="selectType(0)">单词</button>
                    <button type="button" class="btn btn-center" :class="type==1?'btn-primary':'btn-outline-primary'" @click="selectType(1)">句子</button>
                    <button type="button" class="btn btn-center" :class="type==2?'btn-primary':'btn-outline-primary'" @click="selectType(2)">段落</button>
                    <button type="button" class="btn btn-right" :class="type==3?'btn-primary':'btn-outline-primary'" @click="selectType(3)">文章</button>
                </div>
                <div class="border_1_muted radius_4 d-flex align-items-center pr-2 pl-2">
                    <div>截止时间：</div>
                    <datetime 
                        :muted="isPublished ? true : false"
                        type="datetime"
                        value-zone="Asia/Shanghai"
                        zone= "Asia/Shanghai"
                        v-model="datetime"
                        :inputStyle="{border: 'none', width: '168px', cursor: 'pointer', background: 'transparent'}"
                        format="yyyy/MM/dd HH:mm"
                        style="z-index: 10"></datetime>
                    <img src="img/icons/calendar.png" class="icon-small" alt="" style="z-index: 0; margin-left: -20px">
                </div>
                <div class="fn-14">
                    <button v-if="!isPublished" type="button" class="btn btn-primary mr-4" @click="createHomework">确定</button>
                    <button type="button" class="btn border_1_muted" @click="$router.go(-1)">{{isPublished ?  '返回': '取消'}}</button>
                </div>
            </div>
            <div v-if="isPublished" class="mb-2 fn-muted"> 作业范围: {{homeworkScope}} </div>
            <div v-else class="row mb-3 mt-2">
                <div class="col-lg-4 pr-3 pl-3">
                    <custom-select placeholdText="选择课程" :value="selectedCourse" :menus="courseList" class="fn-14" @changeSelection="changedCourse"/>
                </div>
                <div class="col-lg-4 pr-3 pl-3">
                    <custom-select placeholdText="选择单元-课时" :value="selectedLesson" :menus="sortedLessons" class="fn-14" @changeSelection="changedLesson"/>
                </div>
                <div class="col-lg-4 pr-3 pl-3">
                    <button v-if="selectedLesson" type="button" class="pt-2 btn width-full btn-outline-primary" @click="viewClassModal">选择班级</button>
                    <button v-else type="button" class="pt-2 pb-2 btn width-full btn-outline-secondary fn-muted" @click="showAlert('请选择课时对于作业')">选择班级</button>
                </div>
            </div>
            <div class="d-flex align-items-center flex-wrap">
                <div class="common_outline mr-auto mb-2 pt-2 pb-2" style="min-width: 50%">
                    <span>已选班级：</span>
                    <span v-for="(c, index) in classList" :key="index">
                        <span v-if="classSelections[index]" class="mr-2">{{c.name}},</span>
                    </span> 
                </div>
                <div class="common_outline mr-5 mb-2">
                    <span>作业名称：</span>
                    <input type="text" class="border_none" v-model="homeworkName" :readonly="isPublished ? true: false">
                    <img v-if="!isPublished" src="img/icons/del.png" alt="" class="ml-1 coursor-pointer" @click="homeworkName = ''">
                </div>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">{{tabNames[type]}}</th>
                        <th  v-if="type == 0" class="fn-18 fn-black fn-bold-none">音标</th>
                        <th  v-if="type == 0" class="fn-18 fn-black fn-bold-none">翻译</th>
                        <th  class="fn-18 fn-black fn-bold-none" style="min-width: 80px">状态</th>
                        <th  v-if="!isPublished" class="fn-18 fn-black fn-bold-none" style="min-width: 60px">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="text-left">{{item.text}}</td>

                        <td v-if="type == 0">{{item.symbol? item.symbol: '--'}}</td>
                        <td v-if="type == 0">{{item.trans? item.trans: '--'}}</td>
                        
                        <td v-if="isPublished" :class="item.status ? 'fn-info': 'fn-danger'">{{item.status ? '已添加' : '未添加'}}</td>
                        <td v-else :class="addedIDList.includes(item.id) ? 'fn-info': 'fn-danger'">{{addedIDList.includes(item.id) ? '已添加' : '未添加'}}</td>

                        <td v-if="!isPublished" >
                            <div v-if="addedIDList.includes(item.id)" class=" cursor-pointer" :class="selectedLesson ? 'fn-danger' : 'fn-muted'" @click="removeSentence(index)">删除</div>
                            <div v-else class="cursor-pointer"  :class="selectedLesson ? 'fn-primary' : 'fn-muted'" @click="addSentence(index)">添加</div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="sortList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>

        <b-modal 
            class="bg_modal"
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">
            <div class="modal_header border_b_1_muted p-2 fn-16 mb-2">选择班级</div>
            <div class="modal_body fn-16">
                <table class="table table-bordered text-center import_table">
                    <thead>
                        <tr>
                            <th></th>
                            <th  class="fn-16 fn-black fn-bold-none">序号</th>
                            <th  class="fn-16 fn-black fn-bold-none">班级名称</th>
                            <th  class="fn-16 fn-black fn-bold-none th-30-60">作业状态</th>
                        </tr>
                    </thead>
                    
                    <tbody class="fn-16">
                        <tr v-for="(item, index) in classList" :key="index" :class="classSelections[index]? 'active' : ''">
                            <td>
                                <label v-if="!item.inProcess" class="c-checkbox">
                                    <input id="inlineCheckbox10" type="checkbox" v-model="classSelections[index]"/>
                                    <span class="fa fa-check"></span>
                                </label>
                            </td>
                            <td>{{index +1}}</td>
                            <td>{{item.name}}</td>
                            <td>{{item.inProcess ? '已发布' : '待发布'}}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!classList.length" class="text-center text-muted">— 班级没有了 —</div>

                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14 pr-5 pl-5" @click="isModal = false">确定</button>
                        <!-- <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="isModal = false">取消</button> -->
                    </div>
                </div>
            </div>
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import swal from 'sweetalert2'
    import ImageViewer from '@/components/Common/ImageViewer'
    import CustomSelect from '@/components/Common/CustomSelect'
    import Datetime from '@/components/DateTime/Datetime'
    export default {
        components: {
            ImageViewer,
            CustomSelect,
            Datetime
        },
        data () {
            return {
                homeworkScope: '',
                isPublished: false,
                datetime: '',
                tabNames: ['单词', '句子', '段落', '文章'],
                sentenceList: [],
                sortList: [],
                currentPage: 0,
                tmpData: [],
                type: 0,

                courseList: [],
                lessonList: [],
                sortedLessons: [],
                selectedCourse: null,
                selectedLesson: null,

                classList: [],
                classSelections: [],

                homeworkName: '',
                isModal: false,

                addedIDList: []
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            },
            datetime: function(val){
                console.log(val);
            }
        },
        mounted() {
            // var d = new Date();
            // this.datetime = d.toISOString();
            this.isPublished = Number(this.$route.query.isPublished);
            this.lessonID = this.$route.query.lesson;
            this.workID = this.$route.query.id;

            if(this.isPublished) this.initHomeworkData();
            else {
                this.initData();
                this.initLessonList();
            }
        },
        methods: {
            initData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/sentencesInCourses/' + this.getType(), {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        // console.log(response.data);
                        _this.sentenceList = response.data;
                        _this.sortData();
                    })
            },
            initLessonList(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/course_unit_lesson_relation', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        var resData = response.data;
                        _this.courseList = [];
                        _this.lessonList = [];
                        for(var i = 0; i < resData.length; i++){
                            var _course = resData[i];
                            _this.courseList.push({id: _course.id, name: _course.name, lessons: []});
                            for(var j = 0; j < _course.units.length; j++){
                                var _unit = _course.units[j];
                                for(var k = 0; k < _unit.lessons.length; k++){
                                    var _lesson = _unit.lessons[k];
                                    var _lesson = {
                                        id: _lesson.id,
                                        r_name: _lesson.name,
                                        unit_id: _unit.id,
                                        course_id: _course.id,
                                        name: _unit.name + '-' + _lesson.name
                                    }
                                    _this.lessonList.push(_lesson);
                                    _this.courseList[i].lessons.push(_lesson);
                                }
                            }
                        }
                        _this.sortedLessons = _this.lessonList;
                        // console.log(_this.courseList);
                        // console.log(_this.lessonList);
                    })
            },
            initHomeworkData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/homeworkInfo/' + this.workID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        // console.log(response.data);
                        var resData = response.data;
                        _this.homeworkScope = resData.course.name + ' > ' + resData.unit.name + ' > ' + resData.lesson.name;
                        _this.classList = resData.classes;
                        _this.classSelections = resData.classes;
                        _this.homeworkName = resData.name;
                        _this.datetime = new Date(resData.deadline).toISOString();
                        _this.sentenceList = resData.sentences;
                        _this.sortPublishedData();
                    })
            },
            sortData(){
                var _lessonIds = [];
                if(this.selectedLesson){
                    _lessonIds.push(this.selectedLesson.id);
                }else if(this.sortedLessons.length){
                    for(var index in this.sortedLessons) {_lessonIds.push(this.sortedLessons[index].id)}
                }else{
                    this.sortList = this.sentenceList;
                    this.fliterPageData();
                    return;
                }

                this.sortList = [];
                for(var i = 0; i < this.sentenceList.length; i++){
                    if(_lessonIds.includes(this.sentenceList[i].lesson_id)) this.sortList.push(this.sentenceList[i]);
                }
                this.currentPage = 1;
                this.fliterPageData();
            },
            sortPublishedData(){
                var _sen_type = this.getType();
                this.sortList = [];

                for(var index in this.sentenceList){
                    if(this.sentenceList[index].type == _sen_type) this.sortList.push(this.sentenceList[index]);
                }
                
                this.fliterPageData();
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.sortList.slice(offset, offset + 10);
            },
            selectType(index){
                this.type = index;
                this.currentPage = 1;
                if(this.isPublished) this.sortPublishedData();
                else this.initData();
            },
            getType(){
                if(this.type == 0) return 'word';
                else if(this.type == 1) return 'sentence';
                else if(this.type == 2) return 'paragraph';
                else return 'article';
            },
            closeModal(){
                this.isModal = false;
            },
            changedCourse(course){
                if(this.selectedCourse == course) return;
                this.selectedLesson = null;
                this.homeworkName = '';
                this.sortedLessons = [];
                this.classSelections = [];
                this.addedIDList = [];
                if(!course) {this.sortedLessons = this.lessonList; return;}
                this.sortedLessons = course.lessons;

                this.sortData();
            },
            changedLesson(lesson){
                if(this.selectedLesson == lesson) return;
                this.homeworkName = '';
                this.addedIDList = [];

                this.selectedLesson = lesson;
                if(!this.selectedLesson) return;
                
                if(!this.selectedCourse){
                    for(var index in this.courseList){
                        if(this.courseList[index].id == this.selectedLesson.course_id) {
                            this.selectedCourse = this.courseList[index];
                            break;
                        }
                    }
                }

                this.homeworkName = this.selectedLesson.name + '作业';
                this.sortData();
            },
            addSentence(index){
                if(!this.selectedLesson) return;
                this.addedIDList.push(this.tmpData[index].id);
            },
            removeSentence(index){
                if(!this.selectedLesson) return;
                var _index = this.addedIDList.indexOf(this.tmpData[index].id);
                this.addedIDList.splice(_index, 1);
            },
            viewClassModal(){
                if(!this.selectedLesson) return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/homeworkStatusByClasses/' + this.selectedLesson.id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        var resData = response.data;
                        _this.classList = [];
                        for(var i = 0; i < resData.length; i++){
                            var _class = resData[i];
                            if(_class.homeworks.length) _class['inProcess'] = true;
                            else _class['inProcess'] = false;
                            _this.classList.push(_class);
                        }
                        // console.log(_this.classList);
                        _this.isModal = true;
                    })
            },
            createHomework(){
                if(!this.selectedLesson) {return this.showAlert('作业没有完成。请选择课时。');}
                if(!this.datetime) {return this.showAlert(' 截止时间未设置。请设置截止时间。');}
                if(!this.addedIDList.length) {return this.showAlert('作业的内容是空的。请添加作业内容。');}

                var _classIDs = [];
                for(var i= 0; i < this.classSelections.length; i++){
                    if(this.classSelections[i]) _classIDs.push(this.classList[i].id);
                }
                if(!_classIDs.length) {return this.showAlert('班级未选择。请选择班级。');}

                var _homework = {
                    name: this.homeworkName,
                    deadline: this.datetime.replace(/-/g, '/').replace('T', ' ').substr(0, 16),
                    scope: this.selectedCourse.name + '-' + this.selectedLesson.name,
                    course_id: this.selectedCourse.id,
                    unit_id: this.selectedLesson.unit_id
                }

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/teachers/createHomework/' + this.selectedLesson.id,
                    {homework_infos: _homework, classIDs: _classIDs, sentenceIDs: this.addedIDList},
                    {headers: {'authorization': `${token}`}}
                ).then(function (response) {
                    if(response.data.error){
                        if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                        console.log(response.data.error);
                        return;
                    }

                    // console.log(response.data);
                    _this.$router.go(-1);
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
        }
    }
</script>
<style>
    .common_outline{
        border: 1px solid #dde6e9;
        border-radius: 4px;
        padding: 5px 8px;
    }
    .import_table th,
    .import_table td{
        padding: 5px 8px!important;
        border-color: #989898;
    }
    .import_table th{
        background-color: #b5b5b5;
        
    }
    .import_table tr.active td{
        background-color: #ececec;
    }
    .import_table .c-checkbox{
        margin: 0px;
    }
</style>

