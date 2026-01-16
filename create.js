export default async function handler(req, res) {
  const apiUrl = 'https://pay0.shop/api/create-order';

  try {
    // 🔹 get params
    const { id = '', am = '29', days = '' } = req.query;

    // 🔹 random order_id
    const randomOrderId =
      Math.floor(Math.random() * 999999999999999) + 1;

    const postData = {
      customer_mobile: '8145344963',
      customer_name: 'Your Name',
      user_token: 'a3c664acbefc4086122c9f413f553b07',
      amount: am,
      order_id: randomOrderId.toString(),
      redirect_url: `https://idsave.kishanthummar29919.workers.dev/?add=${id}&days=${days}`,
      remark1: 'testremark',
      remark2: 'testremark2'
    };

    const formBody = new URLSearchParams(postData).toString();

    // 1️⃣ payment API call
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    });

    const apiJson = await apiRes.json();

    // 2️⃣ payment_url
    const paymentUrl = apiJson?.result?.payment_url;

    if (!paymentUrl) {
      return res.status(500).json({
        error: 'payment_url not found',
        api: apiJson
      });
    }

    // 3️⃣ fetch payment page HTML
    const pageRes = await fetch(paymentUrl);
    const html = await pageRes.text();

    // 4️⃣ extract QR src
    const srcMatch = html.match(
      /<img[^>]*id=["']qr-image["'][^>]*src=["']([^"']+)["']/i
    );
    const src = srcMatch ? srcMatch[1] : null;

    // 5️⃣ extract Transaction ID
    const txnMatch = html.match(
      /Transaction ID:\s*<\/span>\s*<span[^>]*class=["']value["'][^>]*>([^<]+)<\/span>/i
    );
    const transaction_id = txnMatch ? txnMatch[1].trim() : null;

    // 6️⃣ final output
    const output = src
      ? {
          src,
          order_id: randomOrderId.toString(),
          amount: am,
          transaction_id
        }
      : { html };

    return res.status(200).json(output);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
