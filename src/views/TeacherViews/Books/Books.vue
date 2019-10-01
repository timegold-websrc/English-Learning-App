<template>
    <ContentWrapper>
        <div class="card m-0 pt-4 pb-4 pl-0 pr-0">
            <div class="d-flex mr-0 ml-0 mb-4 fn-18 text-center border_b_2_muted width-full">
                <div class="tab_item" :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">课内教材</div>
                <div class="tab_item" :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">课外教材</div>
            </div>
            <div class="d-flex flex-wrap pr-4 pl-4">
                <div class="mb-4" v-for="(item, index) in tmpList" :key="index" style="width: 250px">
                     <image-viewer class="m-auto" :imageUrl="item.book_url" :width="180" :height="240" :isMuted="true" @click="editBook(index)"/>
                     <div class="text-center fn-18 fn-black mt-2">{{item.name}}</div>
                </div>
                <div class="" style="width: 250px">
                    <image-viewer class="m-auto" imageUrl="" :width="180" :height="240" :isMuted="true" @click="addBook"/>
                </div>
            </div>
            
        </div>
        <b-modal id="modal-center" 
            centered title="BootstrapVue" 
            :no-close-on-backdrop="true" 
            :hide-header="true"
            :hide-footer="true"
            v-model="isModal">
            <div class="modal_body fn-16">
                <div class="d-flex mb-4">
                    <div style="width: 80px">文件分类：</div>
                    <div style="width: 220px">
                        <custom-select class="fn-14 modal_select" bordered="none" placeholdText=" - 文件分类 - " :menus="book_types" @changeSelection="changeBookType"/>
                    </div>
                </div>
                <!-- <div v-if="selectedTabID" class="d-flex mb-4">
                    <div style="width: 80px">年<span class="space-32"></span>级：</div>
                    <div style="width: 220px">
                        <custom-select class="fn-14 modal_select" bordered="none" placeholdText=" - 选择年级 - " :menus="['一年级', '二年级', '三年级']" @changeSelection="selectCourse"/>
                    </div>
                </div>
                <div v-if="selectedTabID" class="d-flex mb-4">
                    <div style="width: 80px">课<span class="space-32"></span>程：</div>
                    <div style="width: 220px">
                        <custom-select class="fn-14 modal_select" bordered="none" placeholdText=" - 选择课程 - " :menus="['一年级', '二年级', '三年级']" @changeSelection="selectCourse"/>    
                    </div>
                </div> -->

                <div class="d-flex mb-4">
                    <div style="width: 80px">文件路径：</div>
                    <div style="width: 168px"><input class="modal_input" type="text" placeholder="请输入内容 "></div>
                    <button type="button" class="btn fn-12 small_btn" @click="selectBookPath">浏览</button>
                </div>
                <div class="d-flex mb-4">
                    <div style="width: 80px">教材名称：</div>
                    <div style="width: 220px"><input class="width-full modal_input" type="text" placeholder="请输入内容 " v-model="newBookName"></div>
                </div>

                <div class="text-center">
                    <image-viewer class="m-auto" :imageUrl="book_url" @changedImage="onChangeBookImag"/>

                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="createNewBook">确定</button>
                        <button type="button" class="flex-row btn btn-outline-primary ml-4 fn-14" @click="closeModal">取消</button>
                    </div>
                </div>
            </div>
            
        </b-modal>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios'
    import CustomSelect from '@/components/Common/CustomSelect'
    import ImageViewer from '@/components/Common/ImageViewer'
    export default {
        components: {
            CustomSelect,
            ImageViewer
        },
        data () {
            return {
                selectedTabID: 0,
                courseBookList: [],
                outsideBookList: [],
                tmpList: [],

                isModal: false,
                book_url: '',
                img_file: null,
                newBookName: '',
                newBookType: null,
                errors: [],

                book_types: [],
                grades: [],
                classes: []
            }
        },
        mounted() {
            this.book_types = [
                {id: 1, name: '文章', type: 'article'},
                {id: 2, name: '音频', type: 'audio'},
                {id: 3, name: '视频', type: 'video'}
            ];
            // this.grades = [{id: 1, name: '一年级'}, {id: 2, name: '二年级'}, {id: 3, name: '三年级'}, {id: 4, name: '四年级'}, {id: 5, name: '五年级'}]
            // this.classes = [{id: 1, name: '一年级上册'}, {id: 2, name: '一年级下册'}, {id: 3, name: ''}]
            this.initBookList();
        },
        methods: {
            initBookList(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/books', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        var resData = response.data;
                        _this.courseBookList = [];
                        _this.outsideBookList = [];

                        for(var index in resData){
                            var book = resData[index];
                            book.book_url = book.book_url ? _this.$serverURL + book.book_url : 'img/dummy.png';
                            if(book.course_type == 'course') _this.courseBookList.push(book);
                            else _this.outsideBookList.push(book);
                        }
                        console.log(resData);
                        _this.filterData();
                    })
                // this.filterData();
            },
            onChangeBookImag(file){
                if(!file) {
                    this.book_url = '';
                    return;
                }
                this.img_file = file;

                var reader = new FileReader()
                var _this = this
                reader.onload = (e) => {
                    _this.book_url = e.target.result
                }
                reader.readAsDataURL(file)
            },
            changeBookType(item){
                this.newBookType = item;
            },
            selectBookPath(){
                console.log('sdfsdfsf');
            },
            selectCourse(index){
                console.log(index);
            },
            createNewBook(){
                if(!this.newBookName) this.errors.push('name');
                if(!this.newBookType) this.errors.push('type');
                if(!this.img_file) this.errors.push('image');

                if(this.errors.length) return;

                var _data = new FormData();
                _data.append('name', this.newBookName);
                _data.append('course_type', this.selectedTabID ? 'outside' : 'course');
                _data.append('use_type', this.newBookType.type);
                _data.append('img_file', this.img_file);

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/teachers/createbook', _data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initBookList();
                        _this.closeModal();
                    })
                
            },
            closeModal(){
                this.book_url = '';
                this.img_file = null;
                this.newBookName = '';
                this.newBookType = null;
                this.isModal = false;
            },
            selectTab(index){
                this.selectedTabID = index;
                this.filterData();
            },
            addBook(){
                this.isModal = true;
            },
            editBook(index){
                this.book_url = this.tmpList[index].book_url;
                this.isModal = true;
            },
            filterData(){
                if(this.selectedTabID) this.tmpList = this.outsideBookList;
                else this.tmpList = this.courseBookList;
            }
        }
    }
</script>
