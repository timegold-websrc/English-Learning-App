<template>
    <ContentWrapper>
        <div class="card p-4 m-0">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/course" class="link-primary">总课程</router-link> > 
                    <span class="cursor-pointer">导入书籍</span>
                </div>
            </div>
            <div class="ml-5 mt-5">
                <div class="d-flex mb-4">
                    <div style="width: 80px" class="fn-16 text-muted">课程名称：</div>
                    <div style="width: 280px" class="fn-18 border_b_1_muted fn-black">{{course_info ? course_info.name : ''}}</div>
                </div>
                <div class="d-flex mb-5 fn-16">
                    <div style="width: 80px" class="fn-16 text-muted">导入书籍：</div>
                    <div style="width: 280px" class="fn-18 border_b_1_muted fn-black">{{book_info ? book_info.name : ''}}</div>
                    <button type="button" class="flex-row btn btn-outline-primary ml-4 btn-sm" @click="openModal">选择书籍</button>
                    <button type="button" class="flex-row btn btn-outline-danger ml-4 btn-sm" @click="removeBook">删除书籍</button>
                </div>
            </div>
            <div class="mt-5 text-center">
                <button type="button" class="flex-row btn btn-primary fn-18" @click="setBookToCourse">确定导入</button>
            </div>
        </div>


        <b-modal 
            class="bg_modal"
            centered
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">
            <div class="modal_header border_b_1_muted p-2 fn-16 mb-2">选择书籍</div>
            <div class="modal_body fn-16">
                <table class="table table-bordered text-center import_table">
                    <thead>
                        <tr>
                            <th></th>
                            <th  class="fn-16 fn-black fn-bold-none">序号</th>
                            <th  class="fn-16 fn-black fn-bold-none">课程名称</th>
                            <th  class="fn-16 fn-black fn-bold-none th-30-60">上传用户</th>
                        </tr>
                    </thead>
                    <tbody class="fn-16">
                        <tr v-for="(item, index) in tmpData" :key="index" :class="selectedBookIndex == index ? 'active' : ''">
                            <td>
                                <label class="c-checkbox">
                                    <input id="inlineCheckbox10" type="checkbox" :checked="selectedBookIndex == index ? true : false" @click="selectedBookIndex = index"/>
                                    <span class="fa fa-check" :class="errors.includes('check_box') ? 'err-check': ''"></span>
                                </label>
                            </td>
                            <td>{{(currentPage-1) * 10 + index +1}}</td>
                            <td>{{item.name}}</td>
                            <td>{{item.teacher ? item.teacher.name : ''}}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="mt-4 d-flex">
                    <b-pagination class="m-auto" :total-rows="bookList.length" v-model="currentPage" :per-page="7"></b-pagination>
                </div>

                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="addBook">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeModal">取消</button>
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
                selectedBookIndex: -1,
                isModal: false,
                currentPage: 0,
                errors: [],

                course_id: null,
                course_info: null,
                bookList: [],
                tmpData: [],
                book_info: null
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            },
            selectedBookIndex: function(val){ this.errors = []; }
        },
        mounted() {
            this.course_id = this.$route.query.course_id;
            this.initCourseData();
        },
        methods: {
            initCourseData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/course/' + this.course_id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.course_info = response.data;
                        if(_this.course_info.books.length) _this.book_info = _this.course_info.books[0];
                        // console.log(_this.course_info);
                    })
            },
            openModal(){
                if(this.bookList.length) {
                    this.setCurrentPage();
                    this.isModal = true;
                } else{
                    var _this = this;
                    var token = this.$store.getters.getToken;
                    axios.get(this.$serverURL + '/api/teachers/booksInCourse', {headers: {'authorization': `${token}`}})
                        .then(function (response) {
                            if(response.data.error){
                                if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                                return;
                            }
                            
                            _this.bookList = response.data;
                            console.log(_this.bookList);
                            _this.setCurrentPage();
                            _this.isModal = true;
                        })
                }
                
            },
            closeModal(){
                this.errors = [];
                this.selectedBookIndex = -1;
                this.currentPage = 0;
                this.isModal = false;
            },
            addBook(){
                if(this.selectedBookIndex == -1) this.errors.push('check_box');
                else {
                    this.book_info = this.tmpData[this.selectedBookIndex];
                    this.closeModal();
                }
            },
            removeBook(){
                this.book_info = null;
                this.selectedBookIndex = -1;
                this.currentPage = 0;
            },
            setBookToCourse(index){
                var removeBookID = -1, addBookID = -1;
                if(this.course_info.books.length){
                    var originBook = this.course_info.books[0];

                    if(this.book_info && originBook.id == this.book_info.id) this.gotoBack();

                    removeBookID = originBook.id;
                    if(this.book_info) addBookID = this.book_info.id; 
                }else{
                    if(!this.book_info) this.gotoBack();
                    addBookID = this.book_info.id;
                }

                var _this = this;
                var token = this.$store.getters.getToken;
                if(removeBookID > -1){
                    axios.delete(this.$serverURL + '/api/teachers/removeBookFromCourse/' + this.course_id + '/' + removeBookID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        removeBookID = -1;
                        if(addBookID == -1) _this.gotoBack();
                    })
                }

                if(addBookID > -1){
                    axios.put(this.$serverURL + '/api/teachers/addBookToCourse/' + this.course_id + '/' + addBookID, {},{headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        addBookID = -1;
                        if(removeBookID == -1) _this.gotoBack();
                    })
                }
            },
            setCurrentPage(){
                if(!this.book_info){
                    this.fliterPageData();
                }else{
                    for(var i = 0;  i < this.bookList.length; i++){
                        if(this.book_info.id == this.bookList[i].id){
                            this.currentPage = Math.floor(i/7) + 1;
                            this.fliterPageData();
                            break;
                        }
                    }
                }
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 7;
                this.tmpData = this.bookList.slice(offset, offset + 7);

                this.selectedBookIndex = -1;
                if(!this.book_info) return;

                for(var i = 0; i < this.tmpData.length; i++){
                    if(this.book_info.id == this.tmpData[i].id) this.selectedBookIndex = i;
                }
            },
            gotoBack(){
                this.$router.push('/teacher/course');
            }
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
