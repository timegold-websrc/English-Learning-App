<template>
    <ContentWrapper>
        <div v-if="isProcessing" class="spinner loader-demo d-flex align-items-center justify-content-center" style="z-index: 10000">
            <div class="ball-spin-fade-loader">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="card p-4 m-0">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">总课程</div>
                <button type="button" class="flex-row btn btn-outline-primary" @click="clickedAddBtn">添加课程</button>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">课程</th>
                        <th v-if="userRole == 'admin'" class="fn-18 fn-black fn-bold-none">状态</th>
                        <th v-else class="fn-18 fn-black fn-bold-none">班级名称</th>
                        <th  class="fn-18 fn-black fn-bold-none " style="width: 185px">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="cursor-pointer link-primary" @click="viewUnit(index)">{{item.name}}</td>
                        <td v-if="userRole == 'admin'" class="text-center">{{item.ispublished ? '已上架' : '未上架'}}</td>
                        <td v-else class="text-left">{{strForClasses(item.classes)}}</td>
                        <td class="text-right">
                            <span v-if="userRole == 'admin'">
                                <button v-if="!item.ispublished" class="btn btn_success btn-sm mr-2" @click="publishCourse(index, true)">上架</button>
                                <button v-else class="btn btn_warning btn-sm mr-2" @click="publishCourse(index, false)">下架</button>
                            </span>
                            <span v-else>
                                <button v-if="item.ispublished" class="btn btn_disable btn-sm mr-2">发布</button>
                                <button v-else class="btn btn_success btn-sm mr-2" @click="publishCourse(index, true)">发布</button>
                            </span>
                            <button v-if="item.ispublished" class="btn btn_disable btn-sm mr-2">编辑</button>
                            <button v-else class="btn btn_primary btn-sm mr-2" @click="clickedEditBtn(index)">编辑</button>
                            <button v-if="item.ispublished" class="btn btn_disable btn-sm">删除</button>
                            <button v-else class="btn btn_danger btn-sm" @click="checkDelete(index)">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="courseList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>

        <b-modal id="courseModal"
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">

            <div class="modal_body fn-16">
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">课程名称：</div>
                    <div style="width: 220px"><input class="modal_input" type="text" v-model="newCourseName"></div>
                </div>
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">年<span class="space-32"></span>级：</div>
                    <div style="width: 220px">
                        <custom-select class="fn-14 modal_select" bordered="none" placeholdText=" - 选择年级 - "
                            :menus="grades"
                            :value="selectedGrade"
                            @changeSelection="changeGrade"/>
                    </div>
                </div>
                <div v-if="userRole == 'teacher' && selectedGrade">
                    <div class="mb-2">班<span class="space-32"></span>级：<span v-if="!sortedClasses.length" class="text-center text-muted">— 没有班级 —</span></div>
                    <div class="pl-2 d-flex flex-wrap">
                        <div v-for="(item, index) in sortedClasses" :key="index" class="mr-4">
                            <label class="c-checkbox">
                                <input id="inlineCheckbox10" type="checkbox" value="option1" v-model="selectedClasses[index]"/>
                                <span class="fa fa-check"></span> {{item.name}}
                            </label>
                        </div>
                    </div>
                </div>

                <div v-if="userRole == 'admin'" class="mt-2 mb-2" style="clear: both">添加封面：</div>
                <div v-else>
                    <div class="d-flex mb-3 align-items-center">
                        <div style="width: 80px">课程类型：</div>
                        <div v-if="selectedCourseIndex > -1" class="border_b_1_muted fn-14 pb-1" style="width: 220px">{{courseType ? courseType.name : ''}}</div>
                        <div v-else style="width: 220px">
                            <custom-select class="fn-14 modal_select" bordered="none" placeholdText=" - 选择类型 - "
                                :menus="typeList"
                                :value="courseType"
                                @changeSelection="changedCourseType"/>
                        </div>
                    </div>
                    <div v-if="courseType" class="d-flex align-items-center mt-2 mb-2">{{courseType.import ? '导入课程' : '添加封面'}}：
                        <button v-if="courseType.import && selectedCourseIndex > -1" class="btn btn_primary btn-sm" @click="clickedBookImage">重新选择</button>
                    </div>
                </div>

                <div class="text-center mt-2">
                    <div v-if="userRole == 'admin'">
                        <image-viewer class="m-auto" :imageUrl="img_url" @changedImage="onChangeBookImag"/>
                    </div>
                    <div v-else>
                        <image-viewer v-if="courseType && !courseType.import" class="m-auto" :imageUrl="img_url" @changedImage="onChangeBookImag"/>
                        <image-viewer v-else class="m-auto" :imageUrl="img_url" :isMuted="true" @click="clickedBookImage"/>
                    </div>

                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="createNewCourse">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeModal">取消</button>
                    </div>
                </div>
            </div>
        </b-modal>

        <b-modal id="importModal" 
            class="bg_modal"
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isImportModal">
            <div class="modal_header border_b_1_muted p-2 fn-16 mb-2">选择参考课程</div>
            <div class="modal_body fn-16">
                <div class="d-flex mb-4 align-items-center">
                    <div style="width: 80px">选择年级：</div>
                    <div style="width: 220px">
                        <custom-select class="fn-14" placeholdText=" - 选择年级 - "
                            :menus="grades"
                            :value="selectedImportGrade"
                            @changeSelection="changeImportGrade"/>
                    </div>
                </div>
                <table class="table table-bordered text-center import_table">
                    <thead>
                        <tr>
                            <th></th>
                            <th  class="fn-16 fn-black fn-bold-none">序号</th>
                            <th  class="fn-16 fn-black fn-bold-none">年级</th>
                            <th  class="fn-16 fn-black fn-bold-none th-30-60">课程名称</th>
                        </tr>
                    </thead>
                    
                    <tbody class="fn-16">
                        <tr v-for="(item, index) in tmpBookData" :key="index" :class="selectedBookIndex == index ? 'active' : ''">
                            <td>
                                <label class="c-checkbox">
                                    <input id="inlineCheckbox10" type="checkbox" :checked="selectedBookIndex == index ? true : false" @click="selectedBookIndex = index"/>
                                    <span class="fa fa-check"></span>
                                </label>
                            </td>
                            <td>{{(currentPage-1) * 10 + index +1}}</td>
                            <td>{{item.grade.name}}</td>
                            <td>{{item.name}}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!tmpBookData.length" class="text-center text-muted">— 参考课程没有了 —</div>

                <div class="mt-4 d-flex">
                    <b-pagination class="m-auto" :total-rows="sortedBookList.length" v-model="currentImportPage" :per-page="7"></b-pagination>
                </div>

                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="importBook">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeImportModal">取消</button>
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
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="deleteCourse">确认</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="selectedCourseIndex = -1; isDelModal = false">取消</button>
                    </div>
                </div>
            </div>
        </b-modal>
    </ContentWrapper>
</template>
<script>
    
    import swal from 'sweetalert2'
    import axios from 'axios';
    import ImageViewer from '@/components/Common/ImageViewer'
    import CustomSelect from '@/components/Common/CustomSelect'
    export default {
        components: {
            ImageViewer,
            CustomSelect
        },
        data () {
            return {
                isModal: false,
                selectedCourseIndex: -1,
                img_url: '',
                img_file: null,
                newCourseName: '',
                selectedGrade: null,
                selectedClasses: [],

                grades: [],
                classes: [],
                sortedClasses: [],
                courseList: [],
                currentPage: 0,
                tmpData: [],

                userRole: 'teacher',
                typeList: [{id: 1, name: '公共课程', import: true}, {id: 2, name: '非公共课程', import:false}],
                courseType: null,

                isImportModal: false,
                selectedImportGrade: null,
                bookList: [],
                sortedBookList: [],
                tmpBookData: [],
                selectedBookIndex: -1,
                currentImportPage: 0,

                isDelModal: false,
                isProcessing: false
            }
        },
        watch: {
            currentPage: function(val){
                this.filterPageData();
            },
            currentImportPage: function(val){
                this.filterImportPage();
            }
        },
        mounted() {
            this.userRole = this.$store.getters.getRole;
            this.initCourseData();
            this.initGradeClassRelation();
            if(this.userRole == 'teacher') this.initBookData();
        },
        methods: {
            initCourseData(){
                this.selectedCourseIndex = -1;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/courses', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.courseList = response.data;
                        console.log(_this.courseList);
                        _this.filterPageData();
                    })
            },
            initGradeClassRelation(){
                var _this = this;
                    var token = this.$store.getters.getToken;
                    axios.get(this.$serverURL + '/api/teachers/grade_class_relation', {headers: {'authorization': `${token}`}})
                        .then(function (response) {
                            if(response.data.error){
                                if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                                console.log(response.data.error);
                                return;
                            }
                            
                            _this.grades = response.data;
                            // console.log(response.data);
                            if(_this.userRole == 'teacher'){
                                for(var index in _this.grades){
                                    _this.classes = _this.classes.concat(_this.grades[index].classes);
                                }
                                // _this.sortedClasses = _this.classes;
                            }
                        })
            },
            initBookData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/referenceCourses', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.bookList = response.data;
                        console.log(_this.bookList);
                    })
            },
            filterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.courseList.slice(offset, offset + 10);
            },
            filterImportPage(){
                this.sortedBookList = [];
                if(this.selectedImportGrade){
                    for(var index in this.bookList){
                        if(this.selectedImportGrade.id == this.bookList[index].grade_id) this.sortedBookList.push(this.bookList[index]);
                    }
                }else{
                    this.sortedBookList = this.bookList;
                }

                var offset = (this.currentImportPage - 1) * 10;
                this.tmpBookData = this.sortedBookList.slice(offset, offset + 10);
            },
            clickedAddBtn(){
                this.selectedGrade = null;
                this.selectedCourseIndex = -1;
                this.selectedClasses = [];
                this.sortedClasses = [];

                this.isModal = true;
            },
            clickedEditBtn(index){
                this.selectedCourseIndex = index;
                var _course = this.tmpData[index];
                
                this.newCourseName = _course.name;
                this.img_url = _course.course_img ? this.$serverURL + _course.course_img : '';
                

                for(var index in this.grades){
                    if(this.grades[index].id == _course.grade_id) {
                        this.selectedGrade = this.grades[index];
                        break;
                    }
                }
                this.changeGrade(this.selectedGrade);

                if(this.userRole == 'teacher'){
                    this.courseType = _course.course_type == 'import' ? this.typeList[0] : this.typeList[1];
                    var _cIDs = [];
                    for(var index in _course.classes){
                        _cIDs.push(_course.classes[index].id);
                    }

                    for(var i = 0 ; i < this.sortedClasses.length; i++){
                        if(_cIDs.includes(this.sortedClasses[i].id)) this.selectedClasses.push(true);
                        else this.selectedClasses.push(false);
                    }
                }
                
                this.isModal = true;
            },
            clickedBookImage(){
                if(this.selectedCourseIndex > -1) return;

                if(this.courseType && this.courseType.import) {
                    this.filterImportPage();                    
                    this.isImportModal = true;
                }else return;
            },
            onChangeBookImag(file){
                if(!file){
                    this.img_url = '';
                    this.img_file = null;
                    return;
                }
                if(file.type != 'image/jpeg') return this.showAlert('请选择jpg或jpeg格式的图像。');
                
                this.img_file = file;
                var reader = new FileReader()
                var _this = this
                reader.onload = (e) => {
                    _this.img_url = e.target.result
                }
                reader.readAsDataURL(file)
            },
            
            closeModal(){
                this.img_url = '';
                this.img_file = null;
                this.newCourseName = '';
                this.selectedClasses = [];
                this.selectedCourseIndex = -1;
                
                this.courseType = null;
                this.selectedBookIndex = -1;
                this.selectedClasses = [];
                this.currentImportPage = 0;
                this.selectedImportGrade = null;
                this.isModal = false;
                this.isProcessing = false;
            },
            closeImportModal(){
                this.isImportModal = false;
                this.selectedImportGrade = null;
                this.isModal = true;
            },
            importBook(){
                console.log(this.selectedBookIndex);
                this.img_url = this.$serverURL + this.tmpBookData[this.selectedBookIndex].course_img;
                this.isModal = true;
            },
            changeImportGrade(grade){
                this.selectedImportGrade = grade;
                this.filterImportPage();
            },
            changeGrade(grade){
                this.selectedGrade = grade;
                this.selectedClasses = [];
                if(!grade) this.sortedClasses = this.classes;
                else this.sortedClasses = grade.classes;
            },
            changedCourseType(type){
                if(!type) return;

                this.courseType = type;
                this.img_url = '';
                this.img_file = null;
            },
            checkCourseName(){
                for(var index in this.courseList){
                    if(this.selectedCourseIndex == index) continue;
                    if(this.newCourseName == this.courseList[index].name) return false;
                }
                return true;
            },
            createNewCourse(){
                if(this.isProcessing) return;
                if(!this.checkCourseName()) {this.showAlert('课程已存在.'); return;}
                if(!this.newCourseName.trim()) {this.showAlert('课程名称为空. 请键入课程名称.'); return;}
                if(!this.selectedGrade) {this.showAlert('年级为空. 请选择年级.'); return;}
                if(!this.img_url) {this.showAlert('课程封面为空. 请添加课程封面.'); return;}

                if(this.userRole == 'admin') { this.createRefCourse(); return; }

                if(!this.courseType) {this.showAlert('请选择课程类型.'); return;}

                var classIDList = [];
                for(var i = 0; i < this.selectedClasses.length; i++){
                    if(this.selectedClasses[i]) classIDList.push(this.sortedClasses[i].id);
                }

                if(this.courseType.import && this.selectedBookIndex > -1) {this.createImportCourse(classIDList); return; }

                var data = new FormData();
                data.append('name', this.newCourseName);
                data.append('class_ids', classIDList);
                data.append('grade_id', this.selectedGrade.id);
                data.append('img_file', this.img_file);
                
                var _this = this;
                var token = this.$store.getters.getToken;
                this.isProcessing = true;
                if(this.selectedCourseIndex > -1){
                    axios.put(this.$serverURL + '/api/teachers/updateCourse/' + this.tmpData[this.selectedCourseIndex].id, data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initCourseData();
                        _this.closeModal();
                    })
                }else{
                    axios.post(this.$serverURL + '/api/teachers/course', data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initCourseData();
                        _this.closeModal();
                    })
                }
            },
            createImportCourse(classIDs){
                var _refCourse = this.tmpBookData[this.selectedBookIndex];
                var _targetCourse = this.tmpData[this.selectedCourseIndex];
                var _data = {
                    name: this.newCourseName,
                    class_ids: classIDs,
                    target_id: _targetCourse ? _targetCourse.id : 0,
                    ref_id: _refCourse.id,
                    grade_id: this.selectedGrade.id
                }

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/teachers/importCourse', _data, {headers: {'authorization': `${token}`}})
                .then(function (response) {
                    if(response.data.error){
                        if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                        console.log(response.data.error);
                        return;
                    }
                    
                    console.log(response.data);
                    _this.initCourseData();
                    _this.closeModal();
                })
            },
            createRefCourse(){
                var data = new FormData();
                data.append('name', this.newCourseName);
                data.append('grade_id', this.selectedGrade.id);
                data.append('img_file', this.img_file);
                
                var _this = this;
                var token = this.$store.getters.getToken;
                
                if(this.selectedCourseIndex > -1){
                    axios.put(this.$serverURL + '/api/teachers/updateRefCourse/' + this.tmpData[this.selectedCourseIndex].id, data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initCourseData();
                        _this.closeModal();
                    })
                }else{
                    axios.post(this.$serverURL + '/api/teachers/createRefCourse', data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initCourseData();
                        _this.closeModal();
                    })
                }
            },
            publishCourse(index, status){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/teachers/setCourseStatus/' + this.tmpData[index].id, {ispublished: status}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        // _this.initCourseData();
                        _this.tmpData[index].ispublished = status;
                    })
            },
            checkDelete(index){
                this.selectedCourseIndex = index;
                if(!this.tmpData[index].units.length) this.deleteCourse();
                else this.isDelModal = true;
            },
            deleteCourse(){
                var delID = this.tmpData[this.selectedCourseIndex].id;
                
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.delete(this.$serverURL + '/api/teachers/course/' + delID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.initCourseData();
                        _this.isDelModal = false;
                    })
            },
            viewUnit(index){
                this.$router.push({path: '/teacher/course/units', query: {course_id: this.tmpData[index].id, course_name: this.tmpData[index].name}})
            },
            strForClasses(array){
                if(!array.length) return '';
                var _str = '';
                for(var i = 0; i < array.length; i++){
                    if(i == 0) _str += array[i].name;
                    else _str += ', ' + array[i].name;
                }
                return _str;
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
