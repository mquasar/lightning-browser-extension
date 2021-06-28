import browser from "webextension-polyfill";
import Dexie from "dexie";

class DB extends Dexie {
  constructor() {
    super("LBE");
    this.version(1).stores({
      allowances: "++id,&host,name,imageURL,tag,enabled,totalBudget,remainingBudget,lastPaymentAt,createdAt",
      payments: "++id,allowanceId,host,name,description,totalAmount,preimage,destination,createdAt",
    });
    this.on("ready", this.loadFromStorage.bind(this));
  }

  async saveToStorage() {
    const allowanceArray = await this.allowances.toArray();
    const paymentsArray = await this.payments.toArray();
    await browser.storage.sync.set({
      allowances: allowanceArray,
      payments: paymentsArray,
    });
    return true;
  }

  async loadFromStorage() {
    try {
      const result = await browser.storage.sync.get(["allowances", "payments"]);
      console.log("Loading DB data from storage");
      if (result.allowances) {
        await this.allowances.bulkAdd(result.allowances);
      }
      if (result.payments) {
        await this.payments.bulkAdd(result.payments);
      }
      return true;
    } catch (e) {
      console.log("Failed to load DB data from storage");
      console.log(e);
    }
  }
}

const db = new DB();

export default db;
