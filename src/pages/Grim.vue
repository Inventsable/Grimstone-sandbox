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
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import db from "../init";

export default {
  data: () => ({
    collection: "7405",
    doc: "0D29f1PZLV37qCkVsSzV",
    loading: false,
  }),
  mounted() {
    console.clear();
  },
  methods: {
    testUpdate() {
      db.collection("users")
        .doc("random-id")
        .set(
          {
            friends: {
              "friend-uid-3": true,
            },
          },
          { merge: true }
        );
    },
    async onSubmit() {
      this.loading = true;
      let result = await this.readTarget();
      console.log(result);
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
      return this.getDocById(this.collection, this.doc);
    },
    onReset() {},
  },
};
</script>

<style>
</style>