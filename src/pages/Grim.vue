<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 400px">
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="collection"
          label="Collection"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Cannot be empty']"
        />
        <q-input
          filled
          v-model="doc"
          label="Target document"
          lazy-rules
          :rules="[(val) => (val !== null && val !== '') || 'Cannot be empty']"
        />
        <div>
          <q-btn
            :loading="loading"
            label="Submit"
            type="submit"
            color="primary"
          />
          <q-btn
            label="Reset"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
          <q-btn
            :loading="modifyAll"
            label="Modify all"
            flat
            class="q-ml-sm"
            color="primary"
            @click="modifyCollection"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import Grimstone from "grimstone";
import config from "../../config";
const grim = new Grimstone(config);

export default {
  data: () => ({
    collection: "764f",
    doc: "0D29f1PZLV37qCkVsSzV",
    loading: false,
    target: null,
    modifyAll: false,
  }),
  mounted() {
    console.clear();
    console.log(grim);
  },
  methods: {
    async modifyCollection() {
      this.modifyAll = true;
      console.log("MODIFY ALL");
      console.time("Modifying documents");
      let result = await grim.modifyCollection(
        this.collection,
        this.modifyEmail
      );
      console.timeEnd("Modifying documents");
      this.modifyAll = false;
      console.log(result);
    },
    modifyEmail(data) {
      return {
        email: data.email.toLowerCase().trim(),
      };
    },
    async onSubmit() {
      this.loading = true;
      this.target = await this.readTarget();
      console.log(this.target.email);
      let result = await this.mergeData();
      console.log(result);

      this.target = await this.readTarget();
      console.log(this.target.email);
      this.loading = false;
    },
    async getDocById(collection, id, getData = true) {
      return await db
        .collection(collection)
        .where(db.app.firebase_.firestore.FieldPath.documentId(), "==", id)
        .get()
        .then((snapshot) => {
          if (!snapshot.docs.length) return false;
          return getData ? snapshot.docs[0].data() : snapshot.docs[0];
        });
    },
    async readTarget() {
      return await this.getDocById(this.collection, this.doc);
    },
    async mergeData() {
      return await db.collection(this.collection).doc(this.doc).set(
        {
          email: this.target.email.toLowerCase().trim(),
        },
        { merge: true }
      );
    },
    onReset() {},
  },
};
</script>

<style>
</style>