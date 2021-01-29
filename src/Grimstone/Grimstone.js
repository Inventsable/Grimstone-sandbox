class Grimstone {
  constructor(config) {
    this.config = config;
    this.db = require("./init").default(config);
    this.isValid = true;
    let requiredKeys = ["apiKey", "authDomain", "appId", "projectId"];
    requiredKeys.forEach(key => {
      if (!new RegExp(key).test(Object.keys(config).join("|")))
        this.isValid = false;
    });
    if (!this.isValid) {
      console.error(
        `Grimstone cannot function without the following keys: ${requiredKeys.join(
          ", "
        )}. You supplied only ${Object.keys(config).join(", ")}`
      );
    }
  }
  test() {
    console.log("INIT");
    console.log(this.db);
  }
  async modifyCollection(collection, callback) {
    if (!(await this.collectionExists(collection))) {
      console.error(`Collection of name ${collection} does not exist`);
      return null;
    }
    let results = await this.getCollection(collection);
    return Promise.all(
      results.map(result => {
        let id = result.ref.id;
        let dataMerge = callback(result.data());
        return Promise.resolve(
          this.db
            .collection(collection)
            .doc(id)
            .set(dataMerge, { merge: true })
        );
      })
    );
    // results.forEach((result, i) => {
    //   if (i < 10) {
    //     let id = result.ref.id;
    //     let dataMerge = callback(result.data());
    //     console.log(id, dataMerge.email);
    //   }
    // });
  }
  async collectionExists(collection) {
    return await this.db
      .collection(collection)
      .get()
      .then(snapshot => {
        return snapshot.docs.length > 0;
      });
  }
  async getCollection(collection) {
    return await this.db
      .collection(collection)
      .get()
      .then(snapshot => {
        if (!snapshot.docs.length) return false;
        return Promise.all(
          snapshot.docs.map(doc => {
            return Promise.resolve(doc);
          })
        );
      });
  }
}

module.exports = Grimstone;
