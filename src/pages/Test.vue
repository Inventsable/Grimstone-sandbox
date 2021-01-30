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
            @click=""
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
    collection: "7397_311",
    doc: "0D29f1PZLV37qCkVsSzV",
    loading: false,
    target: null,
    modifyAll: false,
    db: null,
  }),
  mounted() {
    this.db = db;
    let sample = {
      collection: this.collection,
      where: [
        ["email", ">", "A"],
        ["email", "<", "Z"],
      ],
      orderBy: ["email", "asc"],
      limit: 10,
    };
    this.queryAndModifyCollection(sample, this.lowerCaseEmail);
    // let sample = {
    //   collection: this.collection,
    // };
    // this.testFunc2(sample, this.lowerCaseEmail);
  },
  methods: {
    async onSubmit() {
      this.loading = true;

      this.loading = false;
    },
    lowerCaseEmail(data) {
      console.log(data.email.length, data.email.substring(0, 3));
      return {
        // email: data.email.toLowerCase().trim(),
      };
    },
    async onReset() {
      console.log("RESET");
    },
    async testFunc2(opts, callback, mergeStatus = true) {
      console.log("RES:");
      let results = await this.db.collection(opts.collection);
      if (Array.isArray(opts.where[0])) {
        for (let i = 0; i < opts.where.length; i++)
          results = results.where(...opts.where[i]);
      } else {
        results = results.where(...opts.where);
      }
      results = await results.get();
      results = results.docs;
      let test = results.map((item) => {
        return item.data().email;
      });
      console.log(test);
    },
    testFunc(args) {
      console.log("TEST FUNC");
      console.log(arguments);
    },
    async collectionExists(collection) {
      return await this.db
        .collection(collection)
        .get()
        .then((snapshot) => {
          return snapshot.docs.length > 0;
        });
    },
    async getCollection(collection, limit = 0) {
      let res = limit
        ? await this.db.collection(collection).limit(limit)
        : await this.db.collection(collection);
      return res.get().then((snapshot) => {
        if (!snapshot.docs.length) return false;
        return Promise.all(
          snapshot.docs.map((doc) => {
            return Promise.resolve(doc);
          })
        );
      });
    },
    async queryAndModifyCollection(opts, callback, mergeStatus = true) {
      let results;
      if (!opts.collection || !(await this.collectionExists(opts.collection))) {
        console.error(`Collection of name ${opts.collection} does not exist`);
        return null;
      }
      results = await this.db.collection(opts.collection);
      if (
        Object.keys(opts).includes("collection") &&
        Object.keys(opts).length == 1
      ) {
        results = await this.getCollection(opts.collection);
      } else {
        if (opts.where)
          if (Array.isArray(opts.where[0]))
            for (let i = 0; i < opts.where.length; i++)
              results = results.where(...opts.where[i]);
          else results = results.where(...opts.where);
        if (opts.orderBy) results = results.orderBy(...opts.orderBy);
        if (opts.orderByChild)
          results = results.orderByChild(opts.orderByChild);
        if (opts.orderByKey) results = results.orderByKey(opts.orderByKey);
        if (opts.orderByValue)
          results = results.orderByValue(opts.orderByValue);
        if (opts.limit) results = results.limit(opts.limit);
        results = await results.get();
        results = results.docs;
      }
      return Promise.all(
        results.map((result) => {
          let dataMerge = callback(result.data());
          return this.db
            .collection(opts.collection)
            .doc(result.ref.id)
            .set(dataMerge, { merge: mergeStatus })
            .catch((err) => {
              return Promise.reject(`ERROR @${result.ref.id}: ${err}`);
            })
            .then(() => {
              return Promise.resolve(result.ref.id);
            });
        })
      );
    },
  },
};
</script>

<style>
</style>