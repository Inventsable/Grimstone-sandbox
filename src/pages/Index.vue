<template>
  <q-page class="flex flex-center">
    <div class="min">
      <div class="q-pa-md q-gutter-sm fixed-top">
        <q-btn
          color="primary"
          label="Generate random user list"
          @click="promptList"
        />
        <q-btn v-if="documents.length" label="Clear" @click="clearList" />
        <q-btn v-if="documents.length" label="Modify" @click="modifyList" />
        <q-btn
          v-if="documents.length"
          label="Submit"
          @click="submitList"
          :loading="loading"
        />
      </div>
      <q-list style="margin-top: 80px; padding-bottom: 40px">
        <q-item v-for="(doc, i) in documents" :key="i">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ doc.email.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ doc.productName }}</q-item-label>
            <q-item-label caption lines="1">{{ doc.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import db from "../init";
import Jabber from "jabber";
const jabber = new Jabber();
const Cerobee = require("clerobee");
const cerobee = new Cerobee();

export default {
  name: "PageIndex",
  data: () => ({
    documents: [],
    loading: false,
  }),
  async mounted() {
    console.clear();
    console.log(db);
    this.$q.notify.setDefaults({
      position: "top",
      timeout: 2500,
      textColor: "white",
      actions: [{ icon: "close", color: "white" }],
    });
  },
  methods: {
    promptList() {
      this.createList(this.randomNum(20, this.randomNum(50, 500)));
      console.log(this.documents);
    },
    randomNum(min, max) {
      return Math.floor(Math.random() * max) + min;
    },
    generateProduct() {
      let list = ["Rubberhose", "Overlord", "Timelord"];
      return list[this.randomNum(0, list.length - 1)];
    },
    createList(number) {
      let temp = (this.documents = []);
      for (let i = 0; i < number; i++) temp.push(this.createListItem());
      this.documents = temp;
    },
    createListItem() {
      return {
        email:
          jabber
            .createEmail()
            .split("")
            .map((v) =>
              /[a-zA-Z]/.test(v)
                ? Math.round(Math.random())
                  ? v.toUpperCase()
                  : v.toLowerCase()
                : v
            )
            .join("") + " ",
        licenseKey: cerobee.generate(16),
        price: "45.00",
        productName: this.generateProduct(),
        purchaseDate:
          this.randomDate(new Date(2012, 0, 1), new Date()).getTime() + "",
        purchaseId: cerobee.generate(8),
        quantity: "1",
      };
    },
    async getCollection(collection, getData = true) {
      return await db
        .collection(collection)
        .get()
        .then((snapshot) => {
          if (!snapshot.docs.length) return false;
          return Promise.all(
            snapshot.docs.map((doc) => {
              return Promise.resolve(getData ? doc.data() : doc);
            })
          );
        });
    },
    randomDate(start, end) {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
    },
    clearList() {
      this.documents = [];
    },
    modifyList() {
      this.documents.forEach((doc) => {
        doc.email = doc.email.toLowerCase().trim();
      });
    },
    async submitList() {
      this.loading = true;
      await this.addAllDocs(
        cerobee.generate(4).substring(1, 5),
        this.documents
      );
      this.loading = false;
      this.showNotif();
    },
    async addAllDocs(collection, docs) {
      return Promise.all(
        docs.map((entry) => {
          return this.addDoc(collection, entry);
        })
      );
    },
    async addDoc(collection, data) {
      return await db
        .collection(collection)
        .add(data)
        .then((ref) => {
          return Promise.resolve(ref);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    showNotif() {
      this.$q.notify({
        message: `Database updated with ${this.documents.length} entries`,
        color: "primary",
      });
    },
  },
};
</script>

<style>
.min {
  max-width: 600px;
}

.fixed-top {
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0px;
  /* margin: 0px auto; */
}
</style>