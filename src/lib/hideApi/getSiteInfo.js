import connectDB from "../connectDB";

export async function getSiteInfoDirect() {
  const db = await connectDB();
  const collection = db.collection("site-info");
  const siteInfo = await collection.findOne({ _id: "site-info" });

  if (!siteInfo) {
    throw new Error("Site information not found");
  }

  return siteInfo;
}

export async function upsertSiteInfo(data) {
  // Basic validation — you can enhance this further
  if (!data.siteName || !data.metaTitle || !data.metaDescription) {
    throw new Error(
      "Missing required fields: siteName, metaTitle, metaDescription"
    );
  }

  const db = await connectDB();
  const collection = db.collection("site-info");

  const filter = { _id: "site-info" };
  const update = { $set: data };
  const options = { upsert: true };

  const result = await collection.updateOne(filter, update, options);

  if (!result.acknowledged) {
    throw new Error("Database operation failed to acknowledge");
  }

  return {
    created: !!result.upsertedId,
    updated: !result.upsertedId,
  };
}
