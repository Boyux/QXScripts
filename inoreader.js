let data = JSON.parse($response.body);

items = data["items"].map((element) => {
    let content = element["summary"]["content"].replace(/^.*?<center>.*?Ads from Inoreader.*?<\/center>/, "");
    element["summary"]["content"] = content;
    console.log(content);
    return element;
});
data["items"] = items;

let body = JSON.stringify(data);

$done({ body: body });
