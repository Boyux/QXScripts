let body = null;

switch (true) {
    // 推荐去广告，最后问号不能去掉，以免匹配到story模式
    case /^https:\/\/app\.bilibili\.com\/x\/v2\/feed\/index\?/.test($request.url):
        try {
            let obj = JSON.parse($response.body);
            let items = [];
            for (let item of obj['data']['items']) {
                let itemStr = JSON.stringify(item)
                if (itemStr.indexOf("广告") >= 0) { continue; }
                if (itemStr.indexOf("招聘") >= 0) { continue; }
                if (itemStr.indexOf("岗位") >= 0) { continue; }
                if (item.hasOwnProperty('banner_item')) {
                    let bannerItems = [];
                    for (let banner of item['banner_item']) {
                        if (banner['is_ad'] != true && banner['is_ad_loc'] != true) {
                            bannerItems.push(banner);
                        }
                    }
                    if (bannerItems.length > 0) {
                        item['banner_item'] = bannerItems;
                        items.push(item);
                    }
                } else if (!item.hasOwnProperty('ad_info') && (item['card_type'] === 'small_cover_v2' || item['card_type'] === 'large_cover_v1')) {
                    items.push(item);
                }
            }
            obj['data']['items'] = items;
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`推荐去广告出现异常：${err}`);
        }
        break;
    // 开屏广告处理
    case /^https?:\/\/app\.bilibili\.com\/x\/v2\/splash\/list/.test($request.url):
        try {
            let obj = JSON.parse($response.body);
            if (obj['data'].hasOwnProperty('max_time') && obj['data'].hasOwnProperty('show')) {
                obj['data']['max_time'] = 0;
                obj['data']['min_interval'] = 31536000;
                obj['data']['pull_interval'] = 31536000;
                obj['data']['show']['stime'] = 1915027200;
                obj['data']['show']['etime'] = 1924272000;
            }
            if (obj.hasOwnProperty('data') && obj['data']['list']) {
                for (let i = 0; i < obj['data']['list'].length; i++) {
                    obj['data']['list'][i]['duration'] = 0;
                    obj['data']['list'][i]['begin_time'] = 1915027200;
                    obj['data']['list'][i]['end_time'] = 1924272000;
                }
                body = JSON.stringify(obj);
            }
        } catch (err) {
            console.log(`开屏广告处理出现异常：${err}`);
        }
        break;
    // 标签页处理，如去除会员购等等
    case /^https?:\/\/app\.bilibili\.com\/x\/resource\/show\/tab/.test($request.url):
        try {
            const tabList = ['直播', '推荐', '热门', '追番', '影视'];
            const topList = ['消息'];
            const bottomList = ['首页', '频道', '动态', '我的', '消息'];
            let obj = JSON.parse($response.body);
            if (obj['data']['tab']) {
                let tab = obj['data']['tab'].filter((e) => { return tabList.indexOf(e.name) >= 0; });
                obj['data']['tab'] = tab;
            }
            if (obj['data']['top']) {
                let top = obj['data']['top'].filter((e) => { return topList.indexOf(e.name) >= 0; });
                obj['data']['top'] = top;
            }
            if (obj['data']['bottom']) {
                let bottom = obj['data']['bottom'].filter((e) => { return bottomList.indexOf(e.name) >= 0; });
                obj['data']['bottom'] = bottom;
            }
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`标签页处理出现异常：${err}`);
        }
        break;
    // 我的页面处理，去除一些推广按钮
    case /^https?:\/\/app\.bilibili\.com\/x\/v2\/account\/mine/.test($request.url):
        try {
            const item0List = ['离线缓存', '历史记录', '我的收藏', '稍后再看'];
            const item1List = ['创作首页', '创作学院', '打卡挑战'];
            const item2List = ['我的课程', '个性装扮', '我的钱包', '直播中心'];
            const item3List = ['联系客服', '设置'];
            let obj = JSON.parse($response.body);
            let items0 = obj['data']['sections_v2'][0]['items'].filter((e) => { return item0List.indexOf(e.title) >= 0; });
            obj['data']['sections_v2'][0]['items'] = items0;
            // 创作中心
            let items1 = obj['data']['sections_v2'][1]['items'].filter((e) => { return item1List.indexOf(e.title) >= 0; });
            obj['data']['sections_v2'][1]['items'] = items1;
            // 推荐服务
            let items2 = obj['data']['sections_v2'][2]['items'].filter((e) => { return item2List.indexOf(e.title) >= 0; });
            obj['data']['sections_v2'][2]['items'] = items2;
            // 更多服务，去掉课堂模式和青少年模式
            let items3 = obj['data']['sections_v2'][3]['items'].filter((e) => { return item3List.indexOf(e.title) >= 0; });
            obj['data']['sections_v2'][3]['items'] = items3;
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`我的页面处理出现异常：${err}`);
        }
        break;
    // 直播去广告
    case /^https?:\/\/api\.live\.bilibili\.com\/xlive\/app-room\/v1\/index\/getInfoByRoom/.test($request.url):
        try {
            let obj = JSON.parse($response.body);
            obj['data']['activity_banner_info'] = null;
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`直播去广告出现异常：${err}`);
        }
        break;
    // 追番去广告
    case /^https?:\/\/api\.bilibili\.com\/pgc\/page\/bangumi/.test($request.url):
        try {
            let obj = JSON.parse($response.body);
            for (let card of obj.data.cards) {
                delete card['extra'];
            }
            delete obj['data']['attentions'];
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`追番去广告出现异常：${err}`);
        }
        break;
    // 动态去广告
    case /https?:\/\/api\.bilibili\.com\/pgc\/season\/app\/related\/recommend\?/.test($request.url):
        try {
            let obj = JSON.parse($response.body);
            let cards = obj.data.cards.filter(e => { return true ? e.hasOwnProperty('display') : false });
            obj.data.cards = cards;
            body = JSON.stringify(obj);
        } catch (err) {
            console.log(`动态去广告出现异常：${err}`);
        }
        break;
    default:
        console.log(`unhandled URL: ${$request.url}`);
        break;
}

if (body) {
    $done({ body: body })
} else {
    $done({})
}
