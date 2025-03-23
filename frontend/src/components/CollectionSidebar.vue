<script setup>
import { useCollectionStore} from "../stores/collection.js";
import {storeToRefs} from "pinia";
import CollectionSidebarGamesTable from "./CollectionSidebarGamesTable.vue";
import {computed} from "vue";

const collectionStore = useCollectionStore()
const {isActiveCollection, getActiveCollectionItems, getActiveCollectionNewItems, getActiveCollectionName} = storeToRefs(collectionStore)


const deleteFromExists = (payload) => {
  collectionStore.deleteOldGame(payload.id)
}

const deleteFromNew = (payload) => {
  console.log(payload,'test')
  collectionStore.deleteNewGame(payload.id)
}

const collectionName = computed({
  get() {
    return getActiveCollectionName.value
  },
  set(newValue) {
    collectionStore.setActiveCollectionName(newValue)
  }
})

const closeSidebar = () =>{
  collectionStore.clearActiveCollection()
}

const saveCollection = async() => {
  await collectionStore.saveCollection()
}



</script>

<template>
  <div v-if="isActiveCollection" class="sidebar">

    <button @click="closeSidebar">Close</button>
    <div> Collection name </div>
    <input v-model="collectionName"/>
    <template v-if="Array.isArray(getActiveCollectionItems) && getActiveCollectionItems.length> 0">
    <div>Old</div>
    <CollectionSidebarGamesTable @delete="deleteFromExists"   :games="getActiveCollectionItems"/>
    </template>
    <template v-if="Array.isArray(getActiveCollectionNewItems) && getActiveCollectionNewItems.length> 0">
    <div>New</div>
    <CollectionSidebarGamesTable @delete="deleteFromNew"  :games="getActiveCollectionNewItems"/>
    </template>
    <button @click="saveCollection">Save</button>
  </div>
</template>

<style scoped lang="scss">
.sidebar{
  width:800px;
}
</style>
