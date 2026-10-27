/**
 * 收货地址解析工具
 * - matchRegion：从文本中匹配省 / 市 / 区（支持不带“省 / 市 / 区”后缀的简称）
 * - parseAddress：解析“姓名 + 手机号 + 省市区 + 详细地址”的粘贴文本
 * 数据：由调用方传入 regions（src/mock/regions.js 的结构）
 */

// 去掉行政区划后缀，便于「深圳」匹配「深圳市」
const SUFFIX = /(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|自治州|省|市|地区|区|县)$/;

export function shortName(name) {
  return String(name || "").replace(SUFFIX, "");
}

// 在文本中匹配省 / 市 / 区；未命中省份时返回 null
export function matchRegion(text, regions) {
  if (!text) return null;
  let province = regions.find(
    (p) => text.includes(p.name) || text.includes(shortName(p.name))
  );
  let city = null;

  if (province) {
    city = province.cities.find(
      (c) => text.includes(c.name) || text.includes(shortName(c.name))
    );
  } else {
    // 未写省份时按城市名反查（如「深圳南山区…」）
    for (const p of regions) {
      const hit = p.cities.find(
        (c) => text.includes(c.name) || text.includes(shortName(c.name))
      );
      if (hit) {
        province = p;
        city = hit;
        break;
      }
    }
    if (!province) return null;
  }

  let district = "";
  if (city) {
    district =
      city.districts.find(
        (d) => text.includes(d) || text.includes(shortName(d))
      ) || "";
  }
  // 文本未写城市时，在全省范围内找一次区县
  if (!district) {
    for (const c of province.cities) {
      const hit = c.districts.find(
        (d) => text.includes(d) || text.includes(shortName(d))
      );
      if (hit) {
        city = c;
        district = hit;
        break;
      }
    }
  }
  if (!city) city = province.cities[0];
  if (!district) district = city.districts[0];

  return {
    province: province.name,
    city: city.name,
    district,
  };
}

/**
 * 解析粘贴的收货信息
 * 返回 { name, phone, region, detail }；region 为 null 表示没识别出省市区
 */
export function parseAddress(input, regions) {
  const raw = String(input || "").trim();
  if (!raw) return { name: "", phone: "", region: null, detail: "" };

  const phone = (raw.match(/1[3-9]\d{9}/) || [""])[0];
  let text = raw.replace(
    /收货人|联系人|姓名|手机号码|手机号|手机|联系电话|电话|收货地址|详细地址|地址|[:：]/g,
    " "
  );
  if (phone) text = text.replace(phone, " ");
  text = text.replace(/[,，;；、]/g, " ").replace(/\s+/g, " ").trim();

  const region = matchRegion(text, regions);
  let rest = text;
  if (region) {
    // 省份可能以简称或城市名出现（如「深圳南山区」），取最早命中的位置
    const starts = [
      region.province,
      shortName(region.province),
      region.city,
      shortName(region.city),
    ]
      .map((n) => text.indexOf(n))
      .filter((i) => i >= 0);
    const startPos = starts.length ? Math.min(...starts) : 0;
    const districtPos = text.indexOf(region.district);
    const endPos =
      districtPos >= startPos ? districtPos + region.district.length : startPos;
    rest = (text.slice(0, startPos) + " " + text.slice(endPos))
      .replace(/\s+/g, " ")
      .trim();
  }

  // 姓名：优先取去掉地址后的开头 2-4 个汉字
  let name = "";
  const nameMatch = rest.match(/^([\u4e00-\u9fa5]{2,4})(?=\s|$)/);
  if (nameMatch) {
    name = nameMatch[1];
    rest = rest.slice(nameMatch[0].length).trim();
  }
  // 姓名写在地址之后时，取结尾 2-4 个汉字（要求前面是地址描述）
  if (!name) {
    const tail = rest.match(/\s([\u4e00-\u9fa5]{2,4})$/);
    if (
      tail &&
      /(路|街|号|栋|楼|园|区|镇|村|室|层|大道)/.test(
        rest.slice(0, tail.index)
      )
    ) {
      name = tail[1];
      rest = rest.slice(0, tail.index).trim();
    }
  }

  return { name, phone, region, detail: rest };
}
