let data = JSON.parse($response.body);

items = data["items"].map((element) => {
    let content = element["summary"]["content"].replace(/<center>(.|\s)*?Ads from Inoreader(.|\s)*?<\/center>/, "");
    element["summary"]["content"] = content;
    return element;
});
data["items"] = items;

let body = JSON.stringify(data);

$done({ body: body });
