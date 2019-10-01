<template>
    <ContentWrapper>
        <div class="card p-4 m-0">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/course" class="link-primary">总课程</router-link> > 
                    <span class="cursor-pointer">{{course_name}}</span>
                </div>
                <button v-if="isPublished" type="button" class="fn-muted flex-row btn btn-outline-secondary">添加单元</button>
                <button v-else type="button" class="flex-row btn btn-outline-primary" @click="isModal = true">添加单元</button>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">单元名称</th>
                        <th  class="fn-18 fn-black fn-bold-none th-30-60">操作</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="cursor-pointer link-primary" @click="viewLesson(index)">{{item.name}}</td>
                        <td>
                            <em v-if="isPublished" class="fn-muted fn-24 mr-2 far fa-trash-alt cursor-pointer"></em>
                            <em v-else class="fn-danger fn-24 mr-2 far fa-trash-alt cursor-pointer" @click="checkDelete(index)"></em>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="unitList.length" v-model="currentPage" :per-page="10"></b-pagination>
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
                    <div style="width: 80px">单元名称：</div>
                    <div style="width: 220px"><input class="modal_input" :class="errors.includes('name') ? 'err-border': ''" type="text" v-model="newUnitName"></div>
                </div>

                <div class="text-center">
                    <div class="mt-4">
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="createNewUnit">确定</button>
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
                        <button type="button" class="flex-row btn btn-primary mr-4 fn-14" @click="deleteUnit">确认</button>
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
                selectedUnitIndex: -1,
                isPublished: false,
                isModal: false,
                newUnitName: '',
                errors: [],

                course_id: 0,
                course_name: '',
                unitList: [],
                currentPage: 0,
                tmpData: [],

                isDelModal: false
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.course_id = this.$route.query.course_id;
            this.course_name = this.$route.query.course_name;

            this.initUnitData();
        },
        methods: {
            initUnitData(){
                this.selectedUnitIndex = -1;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/units/'+ this.course_id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        _this.unitList = response.data.units;
                        _this.isPublished = response.data.ispublished ? true : false;
                        console.log(_this.unitList);
                        _this.fliterPageData();
                    })
            },
            createNewUnit(){
                if(!this.newUnitName.trim()) {this.errors.push('name'); return;}

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/teachers/unit/' + this.course_id, {name: this.newUnitName}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        _this.initUnitData();
                        _this.closeModal();
                    })
            },
            closeModal(){
                this.newUnitName = '';
                this.errors = [];
                this.isModal = false;
            },
            checkDelete(index){
                this.selectedUnitIndex = index;
                if(!this.tmpData[index].lessons.length) this.deleteUnit();
                else this.isDelModal = true;
            },
            deleteUnit(){
                var delID = this.tmpData[this.selectedUnitIndex].id;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.delete(this.$serverURL + '/api/teachers/unit/' + delID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.initUnitData();
                        _this.isDelModal = false;
                    })
            },
            viewLesson(index){
                this.$router.push({path: '/teacher/course/lessons', query: {
                    course_id: this.course_id,
                    course_name: this.course_name,
                    unit_id: this.tmpData[index].id,
                    unit_name: this.tmpData[index].name
                }});
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.unitList.slice(offset, offset + 10);
            }
        }
    }
</script>
