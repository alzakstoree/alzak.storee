// Airtable Service

const BASE_URL = `https://api.airtable.com/v0/${window.AIRTABLE_BASE_ID}`;

async function airtableRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${window.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Airtable Error:", data);
    throw new Error(data.error?.message || "Airtable request failed");
  }

  return data;
}

// جلب البيانات
window.fetchRecords = async function (table) {
  const data = await airtableRequest(table);
  return data.records;
};

// إضافة سجل
window.createRecord = async function (table, fields) {
  return airtableRequest(table, {
    method: "POST",
    body: JSON.stringify({ fields })
  });
};

// تعديل سجل
window.updateRecord = async function (table, recordId, fields) {
  return airtableRequest(`${table}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields })
  });
};

// حذف سجل
window.deleteRecord = async function (table, recordId) {
  return airtableRequest(`${table}/${recordId}`, {
    method: "DELETE"
  });
};

console.log("Airtable Service Loaded");