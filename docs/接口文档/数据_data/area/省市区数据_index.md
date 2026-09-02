# 省市区数据

> 获取省市区树形数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `data.area.index` |
| 接口地址 | `POST /api/data/area/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 数据（data） |
| 所属控制器 | Area（省市区数据控制器） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}data/area/index' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509551",
  "data": [
    {
      "id": 11,
      "pid": 0,
      "level": "province",
      "name": "北京市",
      "children": [
        {
          "id": 1101,
          "pid": 11,
          "level": "city",
          "name": "市辖区",
          "children": [
            {
              "id": 110101,
              "pid": 1101,
              "level": "district",
              "name": "东城区"
            },
            {
              "id": 110102,
              "pid": 1101,
              "level": "district",
              "name": "西城区"
            },
            {
              "id": 110105,
              "pid": 1101,
              "level": "district",
              "name": "朝阳区"
            },
            {
              "id": 110106,
              "pid": 1101,
              "level": "district",
              "name": "丰台区"
            },
            {
              "id": 110107,
              "pid": 1101,
              "level": "district",
              "name": "石景山区"
            },
            {
              "id": 110108,
              "pid": 1101,
              "level": "district",
              "name": "海淀区"
            },
            {
              "id": 110109,
              "pid": 1101,
              "level": "district",
              "name": "门头沟区"
            },
            {
              "id": 110111,
              "pid": 1101,
              "level": "district",
              "name": "房山区"
            },
            {
              "id": 110112,
              "pid": 1101,
              "level": "district",
              "name": "通州区"
            },
            {
              "id": 110113,
              "pid": 1101,
              "level": "district",
              "name": "顺义区"
            },
            {
              "id": 110114,
              "pid": 1101,
              "level": "district",
              "name": "昌平区"
            },
            {
              "id": 110115,
              "pid": 1101,
              "level": "district",
              "name": "大兴区"
            },
            {
              "id": 110116,
              "pid": 1101,
              "level": "district",
              "name": "怀柔区"
            },
            {
              "id": 110117,
              "pid": 1101,
              "level": "district",
              "name": "平谷区"
            },
            {
              "id": 110118,
              "pid": 1101,
              "level": "district",
              "name": "密云区"
            },
            {
              "id": 110119,
              "pid": 1101,
              "level": "district",
              "name": "延庆区"
            }
          ]
        }
      ]
    },
    {
      "id": 12,
      "pid": 0,
      "level": "province",
      "name": "天津市",
      "children": [
        {
          "id": 1201,
          "pid": 12,
          "level": "city",
          "name": "市辖区",
          "children": [
            {
              "id": 120101,
              "pid": 1201,
              "level": "district",
              "name": "和平区"
            },
            {
              "id": 120102,
              "pid": 1201,
              "level": "district",
              "name": "河东区"
            },
            {
              "id": 120103,
              "pid": 1201,
              "level": "district",
              "name": "河西区"
            },
            {
              "id": 120104,
              "pid": 1201,
              "level": "district",
              "name": "南开区"
            },
            {
              "id": 120105,
              "pid": 1201,
              "level": "district",
              "name": "河北区"
            },
            {
              "id": 120106,
              "pid": 1201,
              "level": "district",
              "name": "红桥区"
            },
            {
              "id": 120110,
              "pid": 1201,
              "level": "district",
              "name": "东丽区"
            },
            {
              "id": 120111,
              "pid": 1201,
              "level": "district",
              "name": "西青区"
            },
            {
              "id": 120112,
              "pid": 1201,
              "level": "district",
              "name": "津南区"
            },
            {
              "id": 120113,
              "pid": 1201,
              "level": "district",
              "name": "北辰区"
            },
            {
              "id": 120114,
              "pid": 1201,
              "level": "district",
              "name": "武清区"
            },
            {
              "id": 120115,
              "pid": 1201,
              "level": "district",
              "name": "宝坻区"
            },
            {
              "id": 120116,
              "pid": 1201,
              "level": "district",
              "name": "滨海新区"
            },
            {
              "id": 120117,
              "pid": 1201,
              "level": "district",
              "name": "宁河区"
            },
            {
              "id": 120118,
              "pid": 1201,
              "level": "district",
              "name": "静海区"
            },
            {
              "id": 120119,
              "pid": 1201,
              "level": "district",
              "name": "蓟州区"
            }
          ]
        }
      ]
    },
    {
      "id": 13,
      "pid": 0,
      "level": "province",
      "name": "河北省",
      "children": [
        {
          "id": 1301,
          "pid": 13,
          "level": "city",
          "name": "石家庄市",
          "children": [
            {
              "id": 130102,
              "pid": 1301,
              "level": "district",
              "name": "长安区"
            },
            {
              "id": 130104,
              "pid": 1301,
              "level": "district",
              "name": "桥西区"
            },
            {
              "id": 130105,
              "pid": 1301,
              "level": "district",
              "name": "新华区"
            },
            {
              "id": 130107,
              "pid": 1301,
              "level": "district",
              "name": "井陉矿区"
            },
            {
              "id": 130108,
              "pid": 1301,
              "level": "district",
              "name": "裕华区"
            },
            {
              "id": 130109,
              "pid": 1301,
              "level": "district",
              "name": "藁城区"
            },
            {
              "id": 130110,
              "pid": 1301,
              "level": "district",
              "name": "鹿泉区"
            },
            {
              "id": 130111,
              "pid": 1301,
              "level": "district",
              "name": "栾城区"
            },
            {
              "id": 130121,
              "pid": 1301,
              "level": "district",
              "name": "井陉县"
            },
            {
              "id": 130123,
              "pid": 1301,
              "level": "district",
              "name": "正定县"
            },
            {
              "id": 130125,
              "pid": 1301,
              "level": "district",
              "name": "行唐县"
            },
            {
              "id": 130126,
              "pid": 1301,
              "level": "district",
              "name": "灵寿县"
            },
            {
              "id": 130127,
              "pid": 1301,
              "level": "district",
              "name": "高邑县"
            },
            {
              "id": 130128,
              "pid": 1301,
              "level": "district",
              "name": "深泽县"
            },
            {
              "id": 130129,
              "pid": 1301,
              "level": "district",
              "name": "赞皇县"
            },
            {
              "id": 130130,
              "pid": 1301,
              "level": "district",
              "name": "无极县"
            },
            {
              "id": 130131,
              "pid": 1301,
              "level": "district",
              "name": "平山县"
            },
            {
              "id": 130132,
              "pid": 1301,
              "level": "district",
              "name": "元氏县"
            },
            {
              "id": 130133,
              "pid": 1301,
              "level": "district",
              "name": "赵县"
            },
            {
              "id": 130171,
              "pid": 1301,
              "level": "district",
              "name": "石家庄高新技术产业开发区"
            },
            {
              "id": 130172,
              "pid": 1301,
              "level": "district",
              "name": "石家庄循环化工园区"
            },
            {
              "id": 130181,
              "pid": 1301,
              "level": "district",
              "name": "辛集市"
            },
            {
              "id": 130183,
              "pid": 1301,
              "level": "district",
              "name": "晋州市"
            },
            {
              "id": 130184,
              "pid": 1301,
              "level": "district",
              "name": "新乐市"
            }
          ]
        },
        {
          "id": 1302,
          "pid": 13,
          "level": "city",
          "name": "唐山市",
          "children": [
            {
              "id": 130202,
              "pid": 1302,
              "level": "district",
              "name": "路南区"
            },
            {
              "id": 130203,
              "pid": 1302,
              "level": "district",
              "name": "路北区"
            },
            {
              "id": 130204,
              "pid": 1302,
              "level": "district",
              "name": "古冶区"
            },
            {
              "id": 130205,
              "pid": 1302,
              "level": "district",
              "name": "开平区"
            },
            {
              "id": 130207,
              "pid": 1302,
              "level": "district",
              "name": "丰南区"
            },
            {
              "id": 130208,
              "pid": 1302,
              "level": "district",
              "name": "丰润区"
            },
            {
              "id": 130209,
              "pid": 1302,
              "level": "district",
              "name": "曹妃甸区"
            },
            {
              "id": 130224,
              "pid": 1302,
              "level": "district",
              "name": "滦南县"
            },
            {
              "id": 130225,
              "pid": 1302,
              "level": "district",
              "name": "乐亭县"
            },
            {
              "id": 130227,
              "pid": 1302,
              "level": "district",
              "name": "迁西县"
            },
            {
              "id": 130229,
              "pid": 1302,
              "level": "district",
              "name": "玉田县"
            },
            {
              "id": 130271,
              "pid": 1302,
              "level": "district",
              "name": "河北唐山芦台经济开发区"
            },
            {
              "id": 130272,
              "pid": 1302,
              "level": "district",
              "name": "唐山市汉沽管理区"
            },
            {
              "id": 130273,
              "pid": 1302,
              "level": "district",
              "name": "唐山高新技术产业开发区"
            },
            {
              "id": 130274,
              "pid": 1302,
              "level": "district",
              "name": "河北唐山海港经济开发区"
            },
            {
              "id": 130281,
              "pid": 1302,
              "level": "district",
              "name": "遵化市"
            },
            {
              "id": 130283,
              "pid": 1302,
              "level": "district",
              "name": "迁安市"
            },
            {
              "id": 130284,
              "pid": 1302,
              "level": "district",
              "name": "滦州市"
            }
          ]
        },
        {
          "id": 1303,
          "pid": 13,
          "level": "city",
          "name": "秦皇岛市",
          "children": [
            {
              "id": 130302,
              "pid": 1303,
              "level": "district",
              "name": "海港区"
            },
            {
              "id": 130303,
              "pid": 1303,
              "level": "district",
              "name": "山海关区"
            },
            {
              "id": 130304,
              "pid": 1303,
              "level": "district",
              "name": "北戴河区"
            },
            {
              "id": 130306,
              "pid": 1303,
              "level": "district",
              "name": "抚宁区"
            },
            {
              "id": 130321,
              "pid": 1303,
              "level": "district",
              "name": "青龙满族自治县"
            },
            {
              "id": 130322,
              "pid": 1303,
              "level": "district",
              "name": "昌黎县"
            },
            {
              "id": 130324,
              "pid": 1303,
              "level": "district",
              "name": "卢龙县"
            },
            {
              "id": 130371,
              "pid": 1303,
              "level": "district",
              "name": "秦皇岛市经济技术开发区"
            },
            {
              "id": 130372,
              "pid": 1303,
              "level": "district",
              "name": "北戴河新区"
            }
          ]
        },
        {
          "id": 1304,
          "pid": 13,
          "level": "city",
          "name": "邯郸市",
          "children": [
            {
              "id": 130402,
              "pid": 1304,
              "level": "district",
              "name": "邯山区"
            },
            {
              "id": 130403,
              "pid": 1304,
              "level": "district",
              "name": "丛台区"
            },
            {
              "id": 130404,
              "pid": 1304,
              "level": "district",
              "name": "复兴区"
            },
            {
              "id": 130406,
              "pid": 1304,
              "level": "district",
              "name": "峰峰矿区"
            },
            {
              "id": 130407,
              "pid": 1304,
              "level": "district",
              "name": "肥乡区"
            },
            {
              "id": 130408,
              "pid": 1304,
              "level": "district",
              "name": "永年区"
            },
            {
              "id": 130423,
              "pid": 1304,
              "level": "district",
              "name": "临漳县"
            },
            {
              "id": 130424,
              "pid": 1304,
              "level": "district",
              "name": "成安县"
            },
            {
              "id": 130425,
              "pid": 1304,
              "level": "district",
              "name": "大名县"
            },
            {
              "id": 130426,
              "pid": 1304,
              "level": "district",
              "name": "涉县"
            },
            {
              "id": 130427,
              "pid": 1304,
              "level": "district",
              "name": "磁县"
            },
            {
              "id": 130430,
              "pid": 1304,
              "level": "district",
              "name": "邱县"
            },
            {
              "id": 130431,
              "pid": 1304,
              "level": "district",
              "name": "鸡泽县"
            },
            {
              "id": 130432,
              "pid": 1304,
              "level": "district",
              "name": "广平县"
            },
            {
              "id": 130433,
              "pid": 1304,
              "level": "district",
              "name": "馆陶县"
            },
            {
              "id": 130434,
              "pid": 1304,
              "level": "district",
              "name": "魏县"
            },
            {
              "id": 130435,
              "pid": 1304,
              "level": "district",
              "name": "曲周县"
            },
            {
              "id": 130471,
              "pid": 1304,
              "level": "district",
              "name": "邯郸经济技术开发区"
            },
            {
              "id": 130473,
              "pid": 1304,
              "level": "district",
              "name": "邯郸冀南新区"
            },
            {
              "id": 130481,
              "pid": 1304,
              "level": "district",
              "name": "武安市"
            }
          ]
        },
        {
          "id": 1305,
          "pid": 13,
          "level": "city",
          "name": "邢台市",
          "children": [
            {
              "id": 130502,
              "pid": 1305,
              "level": "district",
              "name": "襄都区"
            },
            {
              "id": 130503,
              "pid": 1305,
              "level": "district",
              "name": "信都区"
            },
            {
              "id": 130505,
              "pid": 1305,
              "level": "district",
              "name": "任泽区"
            },
            {
              "id": 130506,
              "pid": 1305,
              "level": "district",
              "name": "南和区"
            },
            {
              "id": 130522,
              "pid": 1305,
              "level": "district",
              "name": "临城县"
            },
            {
              "id": 130523,
              "pid": 1305,
              "level": "district",
              "name": "内丘县"
            },
            {
              "id": 130524,
              "pid": 1305,
              "level": "district",
              "name": "柏乡县"
            },
            {
              "id": 130525,
              "pid": 1305,
              "level": "district",
              "name": "隆尧县"
            },
            {
              "id": 130528,
              "pid": 1305,
              "level": "district",
              "name": "宁晋县"
            },
            {
              "id": 130529,
              "pid": 1305,
              "level": "district",
              "name": "巨鹿县"
            },
            {
              "id": 130530,
              "pid": 1305,
              "level": "district",
              "name": "新河县"
            },
            {
              "id": 130531,
              "pid": 1305,
              "level": "district",
              "name": "广宗县"
            },
            {
              "id": 130532,
              "pid": 1305,
              "level": "district",
              "name": "平乡县"
            },
            {
              "id": 130533,
              "pid": 1305,
              "level": "district",
              "name": "威县"
            },
            {
              "id": 130534,
              "pid": 1305,
              "level": "district",
              "name": "清河县"
            },
            {
              "id": 130535,
              "pid": 1305,
              "level": "district",
              "name": "临西县"
            },
            {
              "id": 130571,
              "pid": 1305,
              "level": "district",
              "name": "河北邢台经济开发区"
            },
            {
              "id": 130581,
              "pid": 1305,
              "level": "district",
              "name": "南宫市"
            },
            {
              "id": 130582,
              "pid": 1305,
              "level": "district",
              "name": "沙河市"
            }
          ]
        },
        {
          "id": 1306,
          "pid": 13,
          "level": "city",
          "name": "保定市",
          "children": [
            {
              "id": 130602,
              "pid": 1306,
              "level": "district",
              "name": "竞秀区"
            },
            {
              "id": 130606,
              "pid": 1306,
              "level": "district",
              "name": "莲池区"
            },
            {
              "id": 130607,
              "pid": 1306,
              "level": "district",
              "name": "满城区"
            },
            {
              "id": 130608,
              "pid": 1306,
              "level": "district",
              "name": "清苑区"
            },
            {
              "id": 130609,
              "pid": 1306,
              "level": "district",
              "name": "徐水区"
            },
            {
              "id": 130623,
              "pid": 1306,
              "level": "district",
              "name": "涞水县"
            },
            {
              "id": 130624,
              "pid": 1306,
              "level": "district",
              "name": "阜平县"
            },
            {
              "id": 130626,
              "pid": 1306,
              "level": "district",
              "name": "定兴县"
            },
            {
              "id": 130627,
              "pid": 1306,
              "level": "district",
              "name": "唐县"
            },
            {
              "id": 130628,
              "pid": 1306,
              "level": "district",
              "name": "高阳县"
            },
            {
              "id": 130629,
              "pid": 1306,
              "level": "district",
              "name": "容城县"
            },
            {
              "id": 130630,
              "pid": 1306,
              "level": "district",
              "name": "涞源县"
            },
            {
              "id": 130631,
              "pid": 1306,
              "level": "district",
              "name": "望都县"
            },
            {
              "id": 130632,
              "pid": 1306,
              "level": "district",
              "name": "安新县"
            },
            {
              "id": 130633,
              "pid": 1306,
              "level": "district",
              "name": "易县"
            },
            {
              "id": 130634,
              "pid": 1306,
              "level": "district",
              "name": "曲阳县"
            },
            {
              "id": 130635,
              "pid": 1306,
              "level": "district",
              "name": "蠡县"
            },
            {
              "id": 130636,
              "pid": 1306,
              "level": "district",
              "name": "顺平县"
            },
            {
              "id": 130637,
              "pid": 1306,
              "level": "district",
              "name": "博野县"
            },
            {
              "id": 130638,
              "pid": 1306,
              "level": "district",
              "name": "雄县"
            },
            {
              "id": 130671,
              "pid": 1306,
              "level": "district",
              "name": "保定高新技术产业开发区"
            },
            {
              "id": 130672,
              "pid": 1306,
              "level": "district",
              "name": "保定白沟新城"
            },
            {
              "id": 130681,
              "pid": 1306,
              "level": "district",
              "name": "涿州市"
            },
            {
              "id": 130682,
              "pid": 1306,
              "level": "district",
              "name": "定州市"
            },
            {
              "id": 130683,
              "pid": 1306,
              "level": "district",
              "name": "安国市"
            },
            {
              "id": 130684,
              "pid": 1306,
              "level": "district",
              "name": "高碑店市"
            }
          ]
        },
        {
          "id": 1307,
          "pid": 13,
          "level": "city",
          "name": "张家口市",
          "children": [
            {
              "id": 130702,
              "pid": 1307,
              "level": "district",
              "name": "桥东区"
            },
            {
              "id": 130703,
              "pid": 1307,
              "level": "district",
              "name": "桥西区"
            },
            {
              "id": 130705,
              "pid": 1307,
              "level": "district",
              "name": "宣化区"
            },
            {
              "id": 130706,
              "pid": 1307,
              "level": "district",
              "name": "下花园区"
            },
            {
              "id": 130708,
              "pid": 1307,
              "level": "district",
              "name": "万全区"
            },
            {
              "id": 130709,
              "pid": 1307,
              "level": "district",
              "name": "崇礼区"
            },
            {
              "id": 130722,
              "pid": 1307,
              "level": "district",
              "name": "张北县"
            },
            {
              "id": 130723,
              "pid": 1307,
              "level": "district",
              "name": "康保县"
            },
            {
              "id": 130724,
              "pid": 1307,
              "level": "district",
              "name": "沽源县"
            },
            {
              "id": 130725,
              "pid": 1307,
              "level": "district",
              "name": "尚义县"
            },
            {
              "id": 130726,
              "pid": 1307,
              "level": "district",
              "name": "蔚县"
            },
            {
              "id": 130727,
              "pid": 1307,
              "level": "district",
              "name": "阳原县"
            },
            {
              "id": 130728,
              "pid": 1307,
              "level": "district",
              "name": "怀安县"
            },
            {
              "id": 130730,
              "pid": 1307,
              "level": "district",
              "name": "怀来县"
            },
            {
              "id": 130731,
              "pid": 1307,
              "level": "district",
              "name": "涿鹿县"
            },
            {
              "id": 130732,
              "pid": 1307,
              "level": "district",
              "name": "赤城县"
            },
            {
              "id": 130771,
              "pid": 1307,
              "level": "district",
              "name": "张家口经济开发区"
            },
            {
              "id": 130772,
              "pid": 1307,
              "level": "district",
              "name": "张家口市察北管理区"
            },
            {
              "id": 130773,
              "pid": 1307,
              "level": "district",
              "name": "张家口市塞北管理区"
            }
          ]
        },
        {
          "id": 1308,
          "pid": 13,
          "level": "city",
          "name": "承德市",
          "children": [
            {
              "id": 130802,
              "pid": 1308,
              "level": "district",
              "name": "双桥区"
            },
            {
              "id": 130803,
              "pid": 1308,
              "level": "district",
              "name": "双滦区"
            },
            {
              "id": 130804,
              "pid": 1308,
              "level": "district",
              "name": "鹰手营子矿区"
            },
            {
              "id": 130821,
              "pid": 1308,
              "level": "district",
              "name": "承德县"
            },
            {
              "id": 130822,
              "pid": 1308,
              "level": "district",
              "name": "兴隆县"
            },
            {
              "id": 130824,
              "pid": 1308,
              "level": "district",
              "name": "滦平县"
            },
            {
              "id": 130825,
              "pid": 1308,
              "level": "district",
              "name": "隆化县"
            },
            {
              "id": 130826,
              "pid": 1308,
              "level": "district",
              "name": "丰宁满族自治县"
            },
            {
              "id": 130827,
              "pid": 1308,
              "level": "district",
              "name": "宽城满族自治县"
            },
            {
              "id": 130828,
              "pid": 1308,
              "level": "district",
              "name": "围场满族蒙古族自治县"
            },
            {
              "id": 130871,
              "pid": 1308,
              "level": "district",
              "name": "承德高新技术产业开发区"
            },
            {
              "id": 130881,
              "pid": 1308,
              "level": "district",
              "name": "平泉市"
            }
          ]
        },
        {
          "id": 1309,
          "pid": 13,
          "level": "city",
          "name": "沧州市",
          "children": [
            {
              "id": 130902,
              "pid": 1309,
              "level": "district",
              "name": "新华区"
            },
            {
              "id": 130903,
              "pid": 1309,
              "level": "district",
              "name": "运河区"
            },
            {
              "id": 130921,
              "pid": 1309,
              "level": "district",
              "name": "沧县"
            },
            {
              "id": 130922,
              "pid": 1309,
              "level": "district",
              "name": "青县"
            },
            {
              "id": 130923,
              "pid": 1309,
              "level": "district",
              "name": "东光县"
            },
            {
              "id": 130924,
              "pid": 1309,
              "level": "district",
              "name": "海兴县"
            },
            {
              "id": 130925,
              "pid": 1309,
              "level": "district",
              "name": "盐山县"
            },
            {
              "id": 130926,
              "pid": 1309,
              "level": "district",
              "name": "肃宁县"
            },
            {
              "id": 130927,
              "pid": 1309,
              "level": "district",
              "name": "南皮县"
            },
            {
              "id": 130928,
              "pid": 1309,
              "level": "district",
              "name": "吴桥县"
            },
            {
              "id": 130929,
              "pid": 1309,
              "level": "district",
              "name": "献县"
            },
            {
              "id": 130930,
              "pid": 1309,
              "level": "district",
              "name": "孟村回族自治县"
            },
            {
              "id": 130971,
              "pid": 1309,
              "level": "district",
              "name": "河北沧州经济开发区"
            },
            {
              "id": 130972,
              "pid": 1309,
              "level": "district",
              "name": "沧州高新技术产业开发区"
            },
            {
              "id": 130973,
              "pid": 1309,
              "level": "district",
              "name": "沧州渤海新区"
            },
            {
              "id": 130981,
              "pid": 1309,
              "level": "district",
              "name": "泊头市"
            },
            {
              "id": 130982,
              "pid": 1309,
              "level": "district",
              "name": "任丘市"
            },
            {
              "id": 130983,
              "pid": 1309,
              "level": "district",
              "name": "黄骅市"
            },
            {
              "id": 130984,
              "pid": 1309,
              "level": "district",
              "name": "河间市"
            }
          ]
        },
        {
          "id": 1310,
          "pid": 13,
          "level": "city",
          "name": "廊坊市",
          "children": [
            {
              "id": 131002,
              "pid": 1310,
              "level": "district",
              "name": "安次区"
            },
            {
              "id": 131003,
              "pid": 1310,
              "level": "district",
              "name": "广阳区"
            },
            {
              "id": 131022,
              "pid": 1310,
              "level": "district",
              "name": "固安县"
            },
            {
              "id": 131023,
              "pid": 1310,
              "level": "district",
              "name": "永清县"
            },
            {
              "id": 131024,
              "pid": 1310,
              "level": "district",
              "name": "香河县"
            },
            {
              "id": 131025,
              "pid": 1310,
              "level": "district",
              "name": "大城县"
            },
            {
              "id": 131026,
              "pid": 1310,
              "level": "district",
              "name": "文安县"
            },
            {
              "id": 131028,
              "pid": 1310,
              "level": "district",
              "name": "大厂回族自治县"
            },
            {
              "id": 131071,
              "pid": 1310,
              "level": "district",
              "name": "廊坊经济技术开发区"
            },
            {
              "id": 131081,
              "pid": 1310,
              "level": "district",
              "name": "霸州市"
            },
            {
              "id": 131082,
              "pid": 1310,
              "level": "district",
              "name": "三河市"
            }
          ]
        },
        {
          "id": 1311,
          "pid": 13,
          "level": "city",
          "name": "衡水市",
          "children": [
            {
              "id": 131102,
              "pid": 1311,
              "level": "district",
              "name": "桃城区"
            },
            {
              "id": 131103,
              "pid": 1311,
              "level": "district",
              "name": "冀州区"
            },
            {
              "id": 131121,
              "pid": 1311,
              "level": "district",
              "name": "枣强县"
            },
            {
              "id": 131122,
              "pid": 1311,
              "level": "district",
              "name": "武邑县"
            },
            {
              "id": 131123,
              "pid": 1311,
              "level": "district",
              "name": "武强县"
            },
            {
              "id": 131124,
              "pid": 1311,
              "level": "district",
              "name": "饶阳县"
            },
            {
              "id": 131125,
              "pid": 1311,
              "level": "district",
              "name": "安平县"
            },
            {
              "id": 131126,
              "pid": 1311,
              "level": "district",
              "name": "故城县"
            },
            {
              "id": 131127,
              "pid": 1311,
              "level": "district",
              "name": "景县"
            },
            {
              "id": 131128,
              "pid": 1311,
              "level": "district",
              "name": "阜城县"
            },
            {
              "id": 131171,
              "pid": 1311,
              "level": "district",
              "name": "河北衡水高新技术产业开发区"
            },
            {
              "id": 131172,
              "pid": 1311,
              "level": "district",
              "name": "衡水滨湖新区"
            },
            {
              "id": 131182,
              "pid": 1311,
              "level": "district",
              "name": "深州市"
            }
          ]
        }
      ]
    },
    {
      "id": 14,
      "pid": 0,
      "level": "province",
      "name": "山西省",
      "children": [
        {
          "id": 1401,
          "pid": 14,
          "level": "city",
          "name": "太原市",
          "children": [
            {
              "id": 140105,
              "pid": 1401,
              "level": "district",
              "name": "小店区"
            },
            {
              "id": 140106,
              "pid": 1401,
              "level": "district",
              "name": "迎泽区"
            },
            {
              "id": 140107,
              "pid": 1401,
              "level": "district",
              "name": "杏花岭区"
            },
            {
              "id": 140108,
              "pid": 1401,
              "level": "district",
              "name": "尖草坪区"
            },
            {
              "id": 140109,
              "pid": 1401,
              "level": "district",
              "name": "万柏林区"
            },
            {
              "id": 140110,
              "pid": 1401,
              "level": "district",
              "name": "晋源区"
            },
            {
              "id": 140121,
              "pid": 1401,
              "level": "district",
              "name": "清徐县"
            },
            {
              "id": 140122,
              "pid": 1401,
              "level": "district",
              "name": "阳曲县"
            },
            {
              "id": 140123,
              "pid": 1401,
              "level": "district",
              "name": "娄烦县"
            },
            {
              "id": 140171,
              "pid": 1401,
              "level": "district",
              "name": "山西转型综合改革示范区"
            },
            {
              "id": 140181,
              "pid": 1401,
              "level": "district",
              "name": "古交市"
            }
          ]
        },
        {
          "id": 1402,
          "pid": 14,
          "level": "city",
          "name": "大同市",
          "children": [
            {
              "id": 140212,
              "pid": 1402,
              "level": "district",
              "name": "新荣区"
            },
            {
              "id": 140213,
              "pid": 1402,
              "level": "district",
              "name": "平城区"
            },
            {
              "id": 140214,
              "pid": 1402,
              "level": "district",
              "name": "云冈区"
            },
            {
              "id": 140215,
              "pid": 1402,
              "level": "district",
              "name": "云州区"
            },
            {
              "id": 140221,
              "pid": 1402,
              "level": "district",
              "name": "阳高县"
            },
            {
              "id": 140222,
              "pid": 1402,
              "level": "district",
              "name": "天镇县"
            },
            {
              "id": 140223,
              "pid": 1402,
              "level": "district",
              "name": "广灵县"
            },
            {
              "id": 140224,
              "pid": 1402,
              "level": "district",
              "name": "灵丘县"
            },
            {
              "id": 140225,
              "pid": 1402,
              "level": "district",
              "name": "浑源县"
            },
            {
              "id": 140226,
              "pid": 1402,
              "level": "district",
              "name": "左云县"
            },
            {
              "id": 140271,
              "pid": 1402,
              "level": "district",
              "name": "山西大同经济开发区"
            }
          ]
        },
        {
          "id": 1403,
          "pid": 14,
          "level": "city",
          "name": "阳泉市",
          "children": [
            {
              "id": 140302,
              "pid": 1403,
              "level": "district",
              "name": "城区"
            },
            {
              "id": 140303,
              "pid": 1403,
              "level": "district",
              "name": "矿区"
            },
            {
              "id": 140311,
              "pid": 1403,
              "level": "district",
              "name": "郊区"
            },
            {
              "id": 140321,
              "pid": 1403,
              "level": "district",
              "name": "平定县"
            },
            {
              "id": 140322,
              "pid": 1403,
              "level": "district",
              "name": "盂县"
            }
          ]
        },
        {
          "id": 1404,
          "pid": 14,
          "level": "city",
          "name": "长治市",
          "children": [
            {
              "id": 140403,
              "pid": 1404,
              "level": "district",
              "name": "潞州区"
            },
            {
              "id": 140404,
              "pid": 1404,
              "level": "district",
              "name": "上党区"
            },
            {
              "id": 140405,
              "pid": 1404,
              "level": "district",
              "name": "屯留区"
            },
            {
              "id": 140406,
              "pid": 1404,
              "level": "district",
              "name": "潞城区"
            },
            {
              "id": 140423,
              "pid": 1404,
              "level": "district",
              "name": "襄垣县"
            },
            {
              "id": 140425,
              "pid": 1404,
              "level": "district",
              "name": "平顺县"
            },
            {
              "id": 140426,
              "pid": 1404,
              "level": "district",
              "name": "黎城县"
            },
            {
              "id": 140427,
              "pid": 1404,
              "level": "district",
              "name": "壶关县"
            },
            {
              "id": 140428,
              "pid": 1404,
              "level": "district",
              "name": "长子县"
            },
            {
              "id": 140429,
              "pid": 1404,
              "level": "district",
              "name": "武乡县"
            },
            {
              "id": 140430,
              "pid": 1404,
              "level": "district",
              "name": "沁县"
            },
            {
              "id": 140431,
              "pid": 1404,
              "level": "district",
              "name": "沁源县"
            },
            {
              "id": 140471,
              "pid": 1404,
              "level": "district",
              "name": "山西长治高新技术产业园区"
            }
          ]
        },
        {
          "id": 1405,
          "pid": 14,
          "level": "city",
          "name": "晋城市",
          "children": [
            {
              "id": 140502,
              "pid": 1405,
              "level": "district",
              "name": "城区"
            },
            {
              "id": 140521,
              "pid": 1405,
              "level": "district",
              "name": "沁水县"
            },
            {
              "id": 140522,
              "pid": 1405,
              "level": "district",
              "name": "阳城县"
            },
            {
              "id": 140524,
              "pid": 1405,
              "level": "district",
              "name": "陵川县"
            },
            {
              "id": 140525,
              "pid": 1405,
              "level": "district",
              "name": "泽州县"
            },
            {
              "id": 140581,
              "pid": 1405,
              "level": "district",
              "name": "高平市"
            }
          ]
        },
        {
          "id": 1406,
          "pid": 14,
          "level": "city",
          "name": "朔州市",
          "children": [
            {
              "id": 140602,
              "pid": 1406,
              "level": "district",
              "name": "朔城区"
            },
            {
              "id": 140603,
              "pid": 1406,
              "level": "district",
              "name": "平鲁区"
            },
            {
              "id": 140621,
              "pid": 1406,
              "level": "district",
              "name": "山阴县"
            },
            {
              "id": 140622,
              "pid": 1406,
              "level": "district",
              "name": "应县"
            },
            {
              "id": 140623,
              "pid": 1406,
              "level": "district",
              "name": "右玉县"
            },
            {
              "id": 140671,
              "pid": 1406,
              "level": "district",
              "name": "山西朔州经济开发区"
            },
            {
              "id": 140681,
              "pid": 1406,
              "level": "district",
              "name": "怀仁市"
            }
          ]
        },
        {
          "id": 1407,
          "pid": 14,
          "level": "city",
          "name": "晋中市",
          "children": [
            {
              "id": 140702,
              "pid": 1407,
              "level": "district",
              "name": "榆次区"
            },
            {
              "id": 140703,
              "pid": 1407,
              "level": "district",
              "name": "太谷区"
            },
            {
              "id": 140721,
              "pid": 1407,
              "level": "district",
              "name": "榆社县"
            },
            {
              "id": 140722,
              "pid": 1407,
              "level": "district",
              "name": "左权县"
            },
            {
              "id": 140723,
              "pid": 1407,
              "level": "district",
              "name": "和顺县"
            },
            {
              "id": 140724,
              "pid": 1407,
              "level": "district",
              "name": "昔阳县"
            },
            {
              "id": 140725,
              "pid": 1407,
              "level": "district",
              "name": "寿阳县"
            },
            {
              "id": 140727,
              "pid": 1407,
              "level": "district",
              "name": "祁县"
            },
            {
              "id": 140728,
              "pid": 1407,
              "level": "district",
              "name": "平遥县"
            },
            {
              "id": 140729,
              "pid": 1407,
              "level": "district",
              "name": "灵石县"
            },
            {
              "id": 140781,
              "pid": 1407,
              "level": "district",
              "name": "介休市"
            }
          ]
        },
        {
          "id": 1408,
          "pid": 14,
          "level": "city",
          "name": "运城市",
          "children": [
            {
              "id": 140802,
              "pid": 1408,
              "level": "district",
              "name": "盐湖区"
            },
            {
              "id": 140821,
              "pid": 1408,
              "level": "district",
              "name": "临猗县"
            },
            {
              "id": 140822,
              "pid": 1408,
              "level": "district",
              "name": "万荣县"
            },
            {
              "id": 140823,
              "pid": 1408,
              "level": "district",
              "name": "闻喜县"
            },
            {
              "id": 140824,
              "pid": 1408,
              "level": "district",
              "name": "稷山县"
            },
            {
              "id": 140825,
              "pid": 1408,
              "level": "district",
              "name": "新绛县"
            },
            {
              "id": 140826,
              "pid": 1408,
              "level": "district",
              "name": "绛县"
            },
            {
              "id": 140827,
              "pid": 1408,
              "level": "district",
              "name": "垣曲县"
            },
            {
              "id": 140828,
              "pid": 1408,
              "level": "district",
              "name": "夏县"
            },
            {
              "id": 140829,
              "pid": 1408,
              "level": "district",
              "name": "平陆县"
            },
            {
              "id": 140830,
              "pid": 1408,
              "level": "district",
              "name": "芮城县"
            },
            {
              "id": 140881,
              "pid": 1408,
              "level": "district",
              "name": "永济市"
            },
            {
              "id": 140882,
              "pid": 1408,
              "level": "district",
              "name": "河津市"
            }
          ]
        },
        {
          "id": 1409,
          "pid": 14,
          "level": "city",
          "name": "忻州市",
          "children": [
            {
              "id": 140902,
              "pid": 1409,
              "level": "district",
              "name": "忻府区"
            },
            {
              "id": 140921,
              "pid": 1409,
              "level": "district",
              "name": "定襄县"
            },
            {
              "id": 140922,
              "pid": 1409,
              "level": "district",
              "name": "五台县"
            },
            {
              "id": 140923,
              "pid": 1409,
              "level": "district",
              "name": "代县"
            },
            {
              "id": 140924,
              "pid": 1409,
              "level": "district",
              "name": "繁峙县"
            },
            {
              "id": 140925,
              "pid": 1409,
              "level": "district",
              "name": "宁武县"
            },
            {
              "id": 140926,
              "pid": 1409,
              "level": "district",
              "name": "静乐县"
            },
            {
              "id": 140927,
              "pid": 1409,
              "level": "district",
              "name": "神池县"
            },
            {
              "id": 140928,
              "pid": 1409,
              "level": "district",
              "name": "五寨县"
            },
            {
              "id": 140929,
              "pid": 1409,
              "level": "district",
              "name": "岢岚县"
            },
            {
              "id": 140930,
              "pid": 1409,
              "level": "district",
              "name": "河曲县"
            },
            {
              "id": 140931,
              "pid": 1409,
              "level": "district",
              "name": "保德县"
            },
            {
              "id": 140932,
              "pid": 1409,
              "level": "district",
              "name": "偏关县"
            },
            {
              "id": 140971,
              "pid": 1409,
              "level": "district",
              "name": "五台山风景名胜区"
            },
            {
              "id": 140981,
              "pid": 1409,
              "level": "district",
              "name": "原平市"
            }
          ]
        },
        {
          "id": 1410,
          "pid": 14,
          "level": "city",
          "name": "临汾市",
          "children": [
            {
              "id": 141002,
              "pid": 1410,
              "level": "district",
              "name": "尧都区"
            },
            {
              "id": 141021,
              "pid": 1410,
              "level": "district",
              "name": "曲沃县"
            },
            {
              "id": 141022,
              "pid": 1410,
              "level": "district",
              "name": "翼城县"
            },
            {
              "id": 141023,
              "pid": 1410,
              "level": "district",
              "name": "襄汾县"
            },
            {
              "id": 141024,
              "pid": 1410,
              "level": "district",
              "name": "洪洞县"
            },
            {
              "id": 141025,
              "pid": 1410,
              "level": "district",
              "name": "古县"
            },
            {
              "id": 141026,
              "pid": 1410,
              "level": "district",
              "name": "安泽县"
            },
            {
              "id": 141027,
              "pid": 1410,
              "level": "district",
              "name": "浮山县"
            },
            {
              "id": 141028,
              "pid": 1410,
              "level": "district",
              "name": "吉县"
            },
            {
              "id": 141029,
              "pid": 1410,
              "level": "district",
              "name": "乡宁县"
            },
            {
              "id": 141030,
              "pid": 1410,
              "level": "district",
              "name": "大宁县"
            },
            {
              "id": 141031,
              "pid": 1410,
              "level": "district",
              "name": "隰县"
            },
            {
              "id": 141032,
              "pid": 1410,
              "level": "district",
              "name": "永和县"
            },
            {
              "id": 141033,
              "pid": 1410,
              "level": "district",
              "name": "蒲县"
            },
            {
              "id": 141034,
              "pid": 1410,
              "level": "district",
              "name": "汾西县"
            },
            {
              "id": 141081,
              "pid": 1410,
              "level": "district",
              "name": "侯马市"
            },
            {
              "id": 141082,
              "pid": 1410,
              "level": "district",
              "name": "霍州市"
            }
          ]
        },
        {
          "id": 1411,
          "pid": 14,
          "level": "city",
          "name": "吕梁市",
          "children": [
            {
              "id": 141102,
              "pid": 1411,
              "level": "district",
              "name": "离石区"
            },
            {
              "id": 141121,
              "pid": 1411,
              "level": "district",
              "name": "文水县"
            },
            {
              "id": 141122,
              "pid": 1411,
              "level": "district",
              "name": "交城县"
            },
            {
              "id": 141123,
              "pid": 1411,
              "level": "district",
              "name": "兴县"
            },
            {
              "id": 141124,
              "pid": 1411,
              "level": "district",
              "name": "临县"
            },
            {
              "id": 141125,
              "pid": 1411,
              "level": "district",
              "name": "柳林县"
            },
            {
              "id": 141126,
              "pid": 1411,
              "level": "district",
              "name": "石楼县"
            },
            {
              "id": 141127,
              "pid": 1411,
              "level": "district",
              "name": "岚县"
            },
            {
              "id": 141128,
              "pid": 1411,
              "level": "district",
              "name": "方山县"
            },
            {
              "id": 141129,
              "pid": 1411,
              "level": "district",
              "name": "中阳县"
            },
            {
              "id": 141130,
              "pid": 1411,
              "level": "district",
              "name": "交口县"
            },
            {
              "id": 141181,
              "pid": 1411,
              "level": "district",
              "name": "孝义市"
            },
            {
              "id": 141182,
              "pid": 1411,
              "level": "district",
              "name": "汾阳市"
            }
          ]
        }
      ]
    },
    {
      "id": 15,
      "pid": 0,
      "level": "province",
      "name": "内蒙古自治区",
      "children": [
        {
          "id": 1501,
          "pid": 15,
          "level": "city",
          "name": "呼和浩特市",
          "children": [
            {
              "id": 150102,
              "pid": 1501,
              "level": "district",
              "name": "新城区"
            },
            {
              "id": 150103,
              "pid": 1501,
              "level": "district",
              "name": "回民区"
            },
            {
              "id": 150104,
              "pid": 1501,
              "level": "district",
              "name": "玉泉区"
            },
            {
              "id": 150105,
              "pid": 1501,
              "level": "district",
              "name": "赛罕区"
            },
            {
              "id": 150121,
              "pid": 1501,
              "level": "district",
              "name": "土默特左旗"
            },
            {
              "id": 150122,
              "pid": 1501,
              "level": "district",
              "name": "托克托县"
            },
            {
              "id": 150123,
              "pid": 1501,
              "level": "district",
              "name": "和林格尔县"
            },
            {
              "id": 150124,
              "pid": 1501,
              "level": "district",
              "name": "清水河县"
            },
            {
              "id": 150125,
              "pid": 1501,
              "level": "district",
              "name": "武川县"
            },
            {
              "id": 150172,
              "pid": 1501,
              "level": "district",
              "name": "呼和浩特经济技术开发区"
            }
          ]
        },
        {
          "id": 1502,
          "pid": 15,
          "level": "city",
          "name": "包头市",
          "children": [
            {
              "id": 150202,
              "pid": 1502,
              "level": "district",
              "name": "东河区"
            },
            {
              "id": 150203,
              "pid": 1502,
              "level": "district",
              "name": "昆都仑区"
            },
            {
              "id": 150204,
              "pid": 1502,
              "level": "district",
              "name": "青山区"
            },
            {
              "id": 150205,
              "pid": 1502,
              "level": "district",
              "name": "石拐区"
            },
            {
              "id": 150206,
              "pid": 1502,
              "level": "district",
              "name": "白云鄂博矿区"
            },
            {
              "id": 150207,
              "pid": 1502,
              "level": "district",
              "name": "九原区"
            },
            {
              "id": 150221,
              "pid": 1502,
              "level": "district",
              "name": "土默特右旗"
            },
            {
              "id": 150222,
              "pid": 1502,
              "level": "district",
              "name": "固阳县"
            },
            {
              "id": 150223,
              "pid": 1502,
              "level": "district",
              "name": "达尔罕茂明安联合旗"
            },
            {
              "id": 150271,
              "pid": 1502,
              "level": "district",
              "name": "包头稀土高新技术产业开发区"
            }
          ]
        },
        {
          "id": 1503,
          "pid": 15,
          "level": "city",
          "name": "乌海市",
          "children": [
            {
              "id": 150302,
              "pid": 1503,
              "level": "district",
              "name": "海勃湾区"
            },
            {
              "id": 150303,
              "pid": 1503,
              "level": "district",
              "name": "海南区"
            },
            {
              "id": 150304,
              "pid": 1503,
              "level": "district",
              "name": "乌达区"
            }
          ]
        },
        {
          "id": 1504,
          "pid": 15,
          "level": "city",
          "name": "赤峰市",
          "children": [
            {
              "id": 150402,
              "pid": 1504,
              "level": "district",
              "name": "红山区"
            },
            {
              "id": 150403,
              "pid": 1504,
              "level": "district",
              "name": "元宝山区"
            },
            {
              "id": 150404,
              "pid": 1504,
              "level": "district",
              "name": "松山区"
            },
            {
              "id": 150421,
              "pid": 1504,
              "level": "district",
              "name": "阿鲁科尔沁旗"
            },
            {
              "id": 150422,
              "pid": 1504,
              "level": "district",
              "name": "巴林左旗"
            },
            {
              "id": 150423,
              "pid": 1504,
              "level": "district",
              "name": "巴林右旗"
            },
            {
              "id": 150424,
              "pid": 1504,
              "level": "district",
              "name": "林西县"
            },
            {
              "id": 150425,
              "pid": 1504,
              "level": "district",
              "name": "克什克腾旗"
            },
            {
              "id": 150426,
              "pid": 1504,
              "level": "district",
              "name": "翁牛特旗"
            },
            {
              "id": 150428,
              "pid": 1504,
              "level": "district",
              "name": "喀喇沁旗"
            },
            {
              "id": 150429,
              "pid": 1504,
              "level": "district",
              "name": "宁城县"
            },
            {
              "id": 150430,
              "pid": 1504,
              "level": "district",
              "name": "敖汉旗"
            }
          ]
        },
        {
          "id": 1505,
          "pid": 15,
          "level": "city",
          "name": "通辽市",
          "children": [
            {
              "id": 150502,
              "pid": 1505,
              "level": "district",
              "name": "科尔沁区"
            },
            {
              "id": 150521,
              "pid": 1505,
              "level": "district",
              "name": "科尔沁左翼中旗"
            },
            {
              "id": 150522,
              "pid": 1505,
              "level": "district",
              "name": "科尔沁左翼后旗"
            },
            {
              "id": 150523,
              "pid": 1505,
              "level": "district",
              "name": "开鲁县"
            },
            {
              "id": 150524,
              "pid": 1505,
              "level": "district",
              "name": "库伦旗"
            },
            {
              "id": 150525,
              "pid": 1505,
              "level": "district",
              "name": "奈曼旗"
            },
            {
              "id": 150526,
              "pid": 1505,
              "level": "district",
              "name": "扎鲁特旗"
            },
            {
              "id": 150571,
              "pid": 1505,
              "level": "district",
              "name": "通辽经济技术开发区"
            },
            {
              "id": 150581,
              "pid": 1505,
              "level": "district",
              "name": "霍林郭勒市"
            }
          ]
        },
        {
          "id": 1506,
          "pid": 15,
          "level": "city",
          "name": "鄂尔多斯市",
          "children": [
            {
              "id": 150602,
              "pid": 1506,
              "level": "district",
              "name": "东胜区"
            },
            {
              "id": 150603,
              "pid": 1506,
              "level": "district",
              "name": "康巴什区"
            },
            {
              "id": 150621,
              "pid": 1506,
              "level": "district",
              "name": "达拉特旗"
            },
            {
              "id": 150622,
              "pid": 1506,
              "level": "district",
              "name": "准格尔旗"
            },
            {
              "id": 150623,
              "pid": 1506,
              "level": "district",
              "name": "鄂托克前旗"
            },
            {
              "id": 150624,
              "pid": 1506,
              "level": "district",
              "name": "鄂托克旗"
            },
            {
              "id": 150625,
              "pid": 1506,
              "level": "district",
              "name": "杭锦旗"
            },
            {
              "id": 150626,
              "pid": 1506,
              "level": "district",
              "name": "乌审旗"
            },
            {
              "id": 150627,
              "pid": 1506,
              "level": "district",
              "name": "伊金霍洛旗"
            }
          ]
        },
        {
          "id": 1507,
          "pid": 15,
          "level": "city",
          "name": "呼伦贝尔市",
          "children": [
            {
              "id": 150702,
              "pid": 1507,
              "level": "district",
              "name": "海拉尔区"
            },
            {
              "id": 150703,
              "pid": 1507,
              "level": "district",
              "name": "扎赉诺尔区"
            },
            {
              "id": 150721,
              "pid": 1507,
              "level": "district",
              "name": "阿荣旗"
            },
            {
              "id": 150722,
              "pid": 1507,
              "level": "district",
              "name": "莫力达瓦达斡尔族自治旗"
            },
            {
              "id": 150723,
              "pid": 1507,
              "level": "district",
              "name": "鄂伦春自治旗"
            },
            {
              "id": 150724,
              "pid": 1507,
              "level": "district",
              "name": "鄂温克族自治旗"
            },
            {
              "id": 150725,
              "pid": 1507,
              "level": "district",
              "name": "陈巴尔虎旗"
            },
            {
              "id": 150726,
              "pid": 1507,
              "level": "district",
              "name": "新巴尔虎左旗"
            },
            {
              "id": 150727,
              "pid": 1507,
              "level": "district",
              "name": "新巴尔虎右旗"
            },
            {
              "id": 150781,
              "pid": 1507,
              "level": "district",
              "name": "满洲里市"
            },
            {
              "id": 150782,
              "pid": 1507,
              "level": "district",
              "name": "牙克石市"
            },
            {
              "id": 150783,
              "pid": 1507,
              "level": "district",
              "name": "扎兰屯市"
            },
            {
              "id": 150784,
              "pid": 1507,
              "level": "district",
              "name": "额尔古纳市"
            },
            {
              "id": 150785,
              "pid": 1507,
              "level": "district",
              "name": "根河市"
            }
          ]
        },
        {
          "id": 1508,
          "pid": 15,
          "level": "city",
          "name": "巴彦淖尔市",
          "children": [
            {
              "id": 150802,
              "pid": 1508,
              "level": "district",
              "name": "临河区"
            },
            {
              "id": 150821,
              "pid": 1508,
              "level": "district",
              "name": "五原县"
            },
            {
              "id": 150822,
              "pid": 1508,
              "level": "district",
              "name": "磴口县"
            },
            {
              "id": 150823,
              "pid": 1508,
              "level": "district",
              "name": "乌拉特前旗"
            },
            {
              "id": 150824,
              "pid": 1508,
              "level": "district",
              "name": "乌拉特中旗"
            },
            {
              "id": 150825,
              "pid": 1508,
              "level": "district",
              "name": "乌拉特后旗"
            },
            {
              "id": 150826,
              "pid": 1508,
              "level": "district",
              "name": "杭锦后旗"
            }
          ]
        },
        {
          "id": 1509,
          "pid": 15,
          "level": "city",
          "name": "乌兰察布市",
          "children": [
            {
              "id": 150902,
              "pid": 1509,
              "level": "district",
              "name": "集宁区"
            },
            {
              "id": 150921,
              "pid": 1509,
              "level": "district",
              "name": "卓资县"
            },
            {
              "id": 150922,
              "pid": 1509,
              "level": "district",
              "name": "化德县"
            },
            {
              "id": 150923,
              "pid": 1509,
              "level": "district",
              "name": "商都县"
            },
            {
              "id": 150924,
              "pid": 1509,
              "level": "district",
              "name": "兴和县"
            },
            {
              "id": 150925,
              "pid": 1509,
              "level": "district",
              "name": "凉城县"
            },
            {
              "id": 150926,
              "pid": 1509,
              "level": "district",
              "name": "察哈尔右翼前旗"
            },
            {
              "id": 150927,
              "pid": 1509,
              "level": "district",
              "name": "察哈尔右翼中旗"
            },
            {
              "id": 150928,
              "pid": 1509,
              "level": "district",
              "name": "察哈尔右翼后旗"
            },
            {
              "id": 150929,
              "pid": 1509,
              "level": "district",
              "name": "四子王旗"
            },
            {
              "id": 150981,
              "pid": 1509,
              "level": "district",
              "name": "丰镇市"
            }
          ]
        },
        {
          "id": 1522,
          "pid": 15,
          "level": "city",
          "name": "兴安盟",
          "children": [
            {
              "id": 152201,
              "pid": 1522,
              "level": "district",
              "name": "乌兰浩特市"
            },
            {
              "id": 152202,
              "pid": 1522,
              "level": "district",
              "name": "阿尔山市"
            },
            {
              "id": 152221,
              "pid": 1522,
              "level": "district",
              "name": "科尔沁右翼前旗"
            },
            {
              "id": 152222,
              "pid": 1522,
              "level": "district",
              "name": "科尔沁右翼中旗"
            },
            {
              "id": 152223,
              "pid": 1522,
              "level": "district",
              "name": "扎赉特旗"
            },
            {
              "id": 152224,
              "pid": 1522,
              "level": "district",
              "name": "突泉县"
            }
          ]
        },
        {
          "id": 1525,
          "pid": 15,
          "level": "city",
          "name": "锡林郭勒盟",
          "children": [
            {
              "id": 152501,
              "pid": 1525,
              "level": "district",
              "name": "二连浩特市"
            },
            {
              "id": 152502,
              "pid": 1525,
              "level": "district",
              "name": "锡林浩特市"
            },
            {
              "id": 152522,
              "pid": 1525,
              "level": "district",
              "name": "阿巴嘎旗"
            },
            {
              "id": 152523,
              "pid": 1525,
              "level": "district",
              "name": "苏尼特左旗"
            },
            {
              "id": 152524,
              "pid": 1525,
              "level": "district",
              "name": "苏尼特右旗"
            },
            {
              "id": 152525,
              "pid": 1525,
              "level": "district",
              "name": "东乌珠穆沁旗"
            },
            {
              "id": 152526,
              "pid": 1525,
              "level": "district",
              "name": "西乌珠穆沁旗"
            },
            {
              "id": 152527,
              "pid": 1525,
              "level": "district",
              "name": "太仆寺旗"
            },
            {
              "id": 152528,
              "pid": 1525,
              "level": "district",
              "name": "镶黄旗"
            },
            {
              "id": 152529,
              "pid": 1525,
              "level": "district",
              "name": "正镶白旗"
            },
            {
              "id": 152530,
              "pid": 1525,
              "level": "district",
              "name": "正蓝旗"
            },
            {
              "id": 152531,
              "pid": 1525,
              "level": "district",
              "name": "多伦县"
            },
            {
              "id": 152571,
              "pid": 1525,
              "level": "district",
              "name": "乌拉盖管委会"
            }
          ]
        },
        {
          "id": 1529,
          "pid": 15,
          "level": "city",
          "name": "阿拉善盟",
          "children": [
            {
              "id": 152921,
              "pid": 1529,
              "level": "district",
              "name": "阿拉善左旗"
            },
            {
              "id": 152922,
              "pid": 1529,
              "level": "district",
              "name": "阿拉善右旗"
            },
            {
              "id": 152923,
              "pid": 1529,
              "level": "district",
              "name": "额济纳旗"
            },
            {
              "id": 152971,
              "pid": 1529,
              "level": "district",
              "name": "内蒙古阿拉善高新技术产业开发区"
            }
          ]
        }
      ]
    },
    {
      "id": 21,
      "pid": 0,
      "level": "province",
      "name": "辽宁省",
      "children": [
        {
          "id": 2101,
          "pid": 21,
          "level": "city",
          "name": "沈阳市",
          "children": [
            {
              "id": 210102,
              "pid": 2101,
              "level": "district",
              "name": "和平区"
            },
            {
              "id": 210103,
              "pid": 2101,
              "level": "district",
              "name": "沈河区"
            },
            {
              "id": 210104,
              "pid": 2101,
              "level": "district",
              "name": "大东区"
            },
            {
              "id": 210105,
              "pid": 2101,
              "level": "district",
              "name": "皇姑区"
            },
            {
              "id": 210106,
              "pid": 2101,
              "level": "district",
              "name": "铁西区"
            },
            {
              "id": 210111,
              "pid": 2101,
              "level": "district",
              "name": "苏家屯区"
            },
            {
              "id": 210112,
              "pid": 2101,
              "level": "district",
              "name": "浑南区"
            },
            {
              "id": 210113,
              "pid": 2101,
              "level": "district",
              "name": "沈北新区"
            },
            {
              "id": 210114,
              "pid": 2101,
              "level": "district",
              "name": "于洪区"
            },
            {
              "id": 210115,
              "pid": 2101,
              "level": "district",
              "name": "辽中区"
            },
            {
              "id": 210123,
              "pid": 2101,
              "level": "district",
              "name": "康平县"
            },
            {
              "id": 210124,
              "pid": 2101,
              "level": "district",
              "name": "法库县"
            },
            {
              "id": 210181,
              "pid": 2101,
              "level": "district",
              "name": "新民市"
            }
          ]
        },
        {
          "id": 2102,
          "pid": 21,
          "level": "city",
          "name": "大连市",
          "children": [
            {
              "id": 210202,
              "pid": 2102,
              "level": "district",
              "name": "中山区"
            },
            {
              "id": 210203,
              "pid": 2102,
              "level": "district",
              "name": "西岗区"
            },
            {
              "id": 210204,
              "pid": 2102,
              "level": "district",
              "name": "沙河口区"
            },
            {
              "id": 210211,
              "pid": 2102,
              "level": "district",
              "name": "甘井子区"
            },
            {
              "id": 210212,
              "pid": 2102,
              "level": "district",
              "name": "旅顺口区"
            },
            {
              "id": 210213,
              "pid": 2102,
              "level": "district",
              "name": "金州区"
            },
            {
              "id": 210214,
              "pid": 2102,
              "level": "district",
              "name": "普兰店区"
            },
            {
              "id": 210224,
              "pid": 2102,
              "level": "district",
              "name": "长海县"
            },
            {
              "id": 210281,
              "pid": 2102,
              "level": "district",
              "name": "瓦房店市"
            },
            {
              "id": 210283,
              "pid": 2102,
              "level": "district",
              "name": "庄河市"
            }
          ]
        },
        {
          "id": 2103,
          "pid": 21,
          "level": "city",
          "name": "鞍山市",
          "children": [
            {
              "id": 210302,
              "pid": 2103,
              "level": "district",
              "name": "铁东区"
            },
            {
              "id": 210303,
              "pid": 2103,
              "level": "district",
              "name": "铁西区"
            },
            {
              "id": 210304,
              "pid": 2103,
              "level": "district",
              "name": "立山区"
            },
            {
              "id": 210311,
              "pid": 2103,
              "level": "district",
              "name": "千山区"
            },
            {
              "id": 210321,
              "pid": 2103,
              "level": "district",
              "name": "台安县"
            },
            {
              "id": 210323,
              "pid": 2103,
              "level": "district",
              "name": "岫岩满族自治县"
            },
            {
              "id": 210381,
              "pid": 2103,
              "level": "district",
              "name": "海城市"
            }
          ]
        },
        {
          "id": 2104,
          "pid": 21,
          "level": "city",
          "name": "抚顺市",
          "children": [
            {
              "id": 210402,
              "pid": 2104,
              "level": "district",
              "name": "新抚区"
            },
            {
              "id": 210403,
              "pid": 2104,
              "level": "district",
              "name": "东洲区"
            },
            {
              "id": 210404,
              "pid": 2104,
              "level": "district",
              "name": "望花区"
            },
            {
              "id": 210411,
              "pid": 2104,
              "level": "district",
              "name": "顺城区"
            },
            {
              "id": 210421,
              "pid": 2104,
              "level": "district",
              "name": "抚顺县"
            },
            {
              "id": 210422,
              "pid": 2104,
              "level": "district",
              "name": "新宾满族自治县"
            },
            {
              "id": 210423,
              "pid": 2104,
              "level": "district",
              "name": "清原满族自治县"
            }
          ]
        },
        {
          "id": 2105,
          "pid": 21,
          "level": "city",
          "name": "本溪市",
          "children": [
            {
              "id": 210502,
              "pid": 2105,
              "level": "district",
              "name": "平山区"
            },
            {
              "id": 210503,
              "pid": 2105,
              "level": "district",
              "name": "溪湖区"
            },
            {
              "id": 210504,
              "pid": 2105,
              "level": "district",
              "name": "明山区"
            },
            {
              "id": 210505,
              "pid": 2105,
              "level": "district",
              "name": "南芬区"
            },
            {
              "id": 210521,
              "pid": 2105,
              "level": "district",
              "name": "本溪满族自治县"
            },
            {
              "id": 210522,
              "pid": 2105,
              "level": "district",
              "name": "桓仁满族自治县"
            }
          ]
        },
        {
          "id": 2106,
          "pid": 21,
          "level": "city",
          "name": "丹东市",
          "children": [
            {
              "id": 210602,
              "pid": 2106,
              "level": "district",
              "name": "元宝区"
            },
            {
              "id": 210603,
              "pid": 2106,
              "level": "district",
              "name": "振兴区"
            },
            {
              "id": 210604,
              "pid": 2106,
              "level": "district",
              "name": "振安区"
            },
            {
              "id": 210624,
              "pid": 2106,
              "level": "district",
              "name": "宽甸满族自治县"
            },
            {
              "id": 210681,
              "pid": 2106,
              "level": "district",
              "name": "东港市"
            },
            {
              "id": 210682,
              "pid": 2106,
              "level": "district",
              "name": "凤城市"
            }
          ]
        },
        {
          "id": 2107,
          "pid": 21,
          "level": "city",
          "name": "锦州市",
          "children": [
            {
              "id": 210702,
              "pid": 2107,
              "level": "district",
              "name": "古塔区"
            },
            {
              "id": 210703,
              "pid": 2107,
              "level": "district",
              "name": "凌河区"
            },
            {
              "id": 210711,
              "pid": 2107,
              "level": "district",
              "name": "太和区"
            },
            {
              "id": 210726,
              "pid": 2107,
              "level": "district",
              "name": "黑山县"
            },
            {
              "id": 210727,
              "pid": 2107,
              "level": "district",
              "name": "义县"
            },
            {
              "id": 210781,
              "pid": 2107,
              "level": "district",
              "name": "凌海市"
            },
            {
              "id": 210782,
              "pid": 2107,
              "level": "district",
              "name": "北镇市"
            }
          ]
        },
        {
          "id": 2108,
          "pid": 21,
          "level": "city",
          "name": "营口市",
          "children": [
            {
              "id": 210802,
              "pid": 2108,
              "level": "district",
              "name": "站前区"
            },
            {
              "id": 210803,
              "pid": 2108,
              "level": "district",
              "name": "西市区"
            },
            {
              "id": 210804,
              "pid": 2108,
              "level": "district",
              "name": "鲅鱼圈区"
            },
            {
              "id": 210811,
              "pid": 2108,
              "level": "district",
              "name": "老边区"
            },
            {
              "id": 210881,
              "pid": 2108,
              "level": "district",
              "name": "盖州市"
            },
            {
              "id": 210882,
              "pid": 2108,
              "level": "district",
              "name": "大石桥市"
            }
          ]
        },
        {
          "id": 2109,
          "pid": 21,
          "level": "city",
          "name": "阜新市",
          "children": [
            {
              "id": 210902,
              "pid": 2109,
              "level": "district",
              "name": "海州区"
            },
            {
              "id": 210903,
              "pid": 2109,
              "level": "district",
              "name": "新邱区"
            },
            {
              "id": 210904,
              "pid": 2109,
              "level": "district",
              "name": "太平区"
            },
            {
              "id": 210905,
              "pid": 2109,
              "level": "district",
              "name": "清河门区"
            },
            {
              "id": 210911,
              "pid": 2109,
              "level": "district",
              "name": "细河区"
            },
            {
              "id": 210921,
              "pid": 2109,
              "level": "district",
              "name": "阜新蒙古族自治县"
            },
            {
              "id": 210922,
              "pid": 2109,
              "level": "district",
              "name": "彰武县"
            }
          ]
        },
        {
          "id": 2110,
          "pid": 21,
          "level": "city",
          "name": "辽阳市",
          "children": [
            {
              "id": 211002,
              "pid": 2110,
              "level": "district",
              "name": "白塔区"
            },
            {
              "id": 211003,
              "pid": 2110,
              "level": "district",
              "name": "文圣区"
            },
            {
              "id": 211004,
              "pid": 2110,
              "level": "district",
              "name": "宏伟区"
            },
            {
              "id": 211005,
              "pid": 2110,
              "level": "district",
              "name": "弓长岭区"
            },
            {
              "id": 211011,
              "pid": 2110,
              "level": "district",
              "name": "太子河区"
            },
            {
              "id": 211021,
              "pid": 2110,
              "level": "district",
              "name": "辽阳县"
            },
            {
              "id": 211081,
              "pid": 2110,
              "level": "district",
              "name": "灯塔市"
            }
          ]
        },
        {
          "id": 2111,
          "pid": 21,
          "level": "city",
          "name": "盘锦市",
          "children": [
            {
              "id": 211102,
              "pid": 2111,
              "level": "district",
              "name": "双台子区"
            },
            {
              "id": 211103,
              "pid": 2111,
              "level": "district",
              "name": "兴隆台区"
            },
            {
              "id": 211104,
              "pid": 2111,
              "level": "district",
              "name": "大洼区"
            },
            {
              "id": 211122,
              "pid": 2111,
              "level": "district",
              "name": "盘山县"
            }
          ]
        },
        {
          "id": 2112,
          "pid": 21,
          "level": "city",
          "name": "铁岭市",
          "children": [
            {
              "id": 211202,
              "pid": 2112,
              "level": "district",
              "name": "银州区"
            },
            {
              "id": 211204,
              "pid": 2112,
              "level": "district",
              "name": "清河区"
            },
            {
              "id": 211221,
              "pid": 2112,
              "level": "district",
              "name": "铁岭县"
            },
            {
              "id": 211223,
              "pid": 2112,
              "level": "district",
              "name": "西丰县"
            },
            {
              "id": 211224,
              "pid": 2112,
              "level": "district",
              "name": "昌图县"
            },
            {
              "id": 211281,
              "pid": 2112,
              "level": "district",
              "name": "调兵山市"
            },
            {
              "id": 211282,
              "pid": 2112,
              "level": "district",
              "name": "开原市"
            }
          ]
        },
        {
          "id": 2113,
          "pid": 21,
          "level": "city",
          "name": "朝阳市",
          "children": [
            {
              "id": 211302,
              "pid": 2113,
              "level": "district",
              "name": "双塔区"
            },
            {
              "id": 211303,
              "pid": 2113,
              "level": "district",
              "name": "龙城区"
            },
            {
              "id": 211321,
              "pid": 2113,
              "level": "district",
              "name": "朝阳县"
            },
            {
              "id": 211322,
              "pid": 2113,
              "level": "district",
              "name": "建平县"
            },
            {
              "id": 211324,
              "pid": 2113,
              "level": "district",
              "name": "喀喇沁左翼蒙古族自治县"
            },
            {
              "id": 211381,
              "pid": 2113,
              "level": "district",
              "name": "北票市"
            },
            {
              "id": 211382,
              "pid": 2113,
              "level": "district",
              "name": "凌源市"
            }
          ]
        },
        {
          "id": 2114,
          "pid": 21,
          "level": "city",
          "name": "葫芦岛市",
          "children": [
            {
              "id": 211402,
              "pid": 2114,
              "level": "district",
              "name": "连山区"
            },
            {
              "id": 211403,
              "pid": 2114,
              "level": "district",
              "name": "龙港区"
            },
            {
              "id": 211404,
              "pid": 2114,
              "level": "district",
              "name": "南票区"
            },
            {
              "id": 211421,
              "pid": 2114,
              "level": "district",
              "name": "绥中县"
            },
            {
              "id": 211422,
              "pid": 2114,
              "level": "district",
              "name": "建昌县"
            },
            {
              "id": 211481,
              "pid": 2114,
              "level": "district",
              "name": "兴城市"
            }
          ]
        }
      ]
    },
    {
      "id": 22,
      "pid": 0,
      "level": "province",
      "name": "吉林省",
      "children": [
        {
          "id": 2201,
          "pid": 22,
          "level": "city",
          "name": "长春市",
          "children": [
            {
              "id": 220102,
              "pid": 2201,
              "level": "district",
              "name": "南关区"
            },
            {
              "id": 220103,
              "pid": 2201,
              "level": "district",
              "name": "宽城区"
            },
            {
              "id": 220104,
              "pid": 2201,
              "level": "district",
              "name": "朝阳区"
            },
            {
              "id": 220105,
              "pid": 2201,
              "level": "district",
              "name": "二道区"
            },
            {
              "id": 220106,
              "pid": 2201,
              "level": "district",
              "name": "绿园区"
            },
            {
              "id": 220112,
              "pid": 2201,
              "level": "district",
              "name": "双阳区"
            },
            {
              "id": 220113,
              "pid": 2201,
              "level": "district",
              "name": "九台区"
            },
            {
              "id": 220122,
              "pid": 2201,
              "level": "district",
              "name": "农安县"
            },
            {
              "id": 220171,
              "pid": 2201,
              "level": "district",
              "name": "长春经济技术开发区"
            },
            {
              "id": 220172,
              "pid": 2201,
              "level": "district",
              "name": "长春净月高新技术产业开发区"
            },
            {
              "id": 220173,
              "pid": 2201,
              "level": "district",
              "name": "长春高新技术产业开发区"
            },
            {
              "id": 220174,
              "pid": 2201,
              "level": "district",
              "name": "长春汽车经济技术开发区"
            },
            {
              "id": 220182,
              "pid": 2201,
              "level": "district",
              "name": "榆树市"
            },
            {
              "id": 220183,
              "pid": 2201,
              "level": "district",
              "name": "德惠市"
            },
            {
              "id": 220184,
              "pid": 2201,
              "level": "district",
              "name": "公主岭市"
            }
          ]
        },
        {
          "id": 2202,
          "pid": 22,
          "level": "city",
          "name": "吉林市",
          "children": [
            {
              "id": 220202,
              "pid": 2202,
              "level": "district",
              "name": "昌邑区"
            },
            {
              "id": 220203,
              "pid": 2202,
              "level": "district",
              "name": "龙潭区"
            },
            {
              "id": 220204,
              "pid": 2202,
              "level": "district",
              "name": "船营区"
            },
            {
              "id": 220211,
              "pid": 2202,
              "level": "district",
              "name": "丰满区"
            },
            {
              "id": 220221,
              "pid": 2202,
              "level": "district",
              "name": "永吉县"
            },
            {
              "id": 220271,
              "pid": 2202,
              "level": "district",
              "name": "吉林经济开发区"
            },
            {
              "id": 220272,
              "pid": 2202,
              "level": "district",
              "name": "吉林高新技术产业开发区"
            },
            {
              "id": 220273,
              "pid": 2202,
              "level": "district",
              "name": "吉林中国新加坡食品区"
            },
            {
              "id": 220281,
              "pid": 2202,
              "level": "district",
              "name": "蛟河市"
            },
            {
              "id": 220282,
              "pid": 2202,
              "level": "district",
              "name": "桦甸市"
            },
            {
              "id": 220283,
              "pid": 2202,
              "level": "district",
              "name": "舒兰市"
            },
            {
              "id": 220284,
              "pid": 2202,
              "level": "district",
              "name": "磐石市"
            }
          ]
        },
        {
          "id": 2203,
          "pid": 22,
          "level": "city",
          "name": "四平市",
          "children": [
            {
              "id": 220302,
              "pid": 2203,
              "level": "district",
              "name": "铁西区"
            },
            {
              "id": 220303,
              "pid": 2203,
              "level": "district",
              "name": "铁东区"
            },
            {
              "id": 220322,
              "pid": 2203,
              "level": "district",
              "name": "梨树县"
            },
            {
              "id": 220323,
              "pid": 2203,
              "level": "district",
              "name": "伊通满族自治县"
            },
            {
              "id": 220382,
              "pid": 2203,
              "level": "district",
              "name": "双辽市"
            }
          ]
        },
        {
          "id": 2204,
          "pid": 22,
          "level": "city",
          "name": "辽源市",
          "children": [
            {
              "id": 220402,
              "pid": 2204,
              "level": "district",
              "name": "龙山区"
            },
            {
              "id": 220403,
              "pid": 2204,
              "level": "district",
              "name": "西安区"
            },
            {
              "id": 220421,
              "pid": 2204,
              "level": "district",
              "name": "东丰县"
            },
            {
              "id": 220422,
              "pid": 2204,
              "level": "district",
              "name": "东辽县"
            }
          ]
        },
        {
          "id": 2205,
          "pid": 22,
          "level": "city",
          "name": "通化市",
          "children": [
            {
              "id": 220502,
              "pid": 2205,
              "level": "district",
              "name": "东昌区"
            },
            {
              "id": 220503,
              "pid": 2205,
              "level": "district",
              "name": "二道江区"
            },
            {
              "id": 220521,
              "pid": 2205,
              "level": "district",
              "name": "通化县"
            },
            {
              "id": 220523,
              "pid": 2205,
              "level": "district",
              "name": "辉南县"
            },
            {
              "id": 220524,
              "pid": 2205,
              "level": "district",
              "name": "柳河县"
            },
            {
              "id": 220581,
              "pid": 2205,
              "level": "district",
              "name": "梅河口市"
            },
            {
              "id": 220582,
              "pid": 2205,
              "level": "district",
              "name": "集安市"
            }
          ]
        },
        {
          "id": 2206,
          "pid": 22,
          "level": "city",
          "name": "白山市",
          "children": [
            {
              "id": 220602,
              "pid": 2206,
              "level": "district",
              "name": "浑江区"
            },
            {
              "id": 220605,
              "pid": 2206,
              "level": "district",
              "name": "江源区"
            },
            {
              "id": 220621,
              "pid": 2206,
              "level": "district",
              "name": "抚松县"
            },
            {
              "id": 220622,
              "pid": 2206,
              "level": "district",
              "name": "靖宇县"
            },
            {
              "id": 220623,
              "pid": 2206,
              "level": "district",
              "name": "长白朝鲜族自治县"
            },
            {
              "id": 220681,
              "pid": 2206,
              "level": "district",
              "name": "临江市"
            }
          ]
        },
        {
          "id": 2207,
          "pid": 22,
          "level": "city",
          "name": "松原市",
          "children": [
            {
              "id": 220702,
              "pid": 2207,
              "level": "district",
              "name": "宁江区"
            },
            {
              "id": 220721,
              "pid": 2207,
              "level": "district",
              "name": "前郭尔罗斯蒙古族自治县"
            },
            {
              "id": 220722,
              "pid": 2207,
              "level": "district",
              "name": "长岭县"
            },
            {
              "id": 220723,
              "pid": 2207,
              "level": "district",
              "name": "乾安县"
            },
            {
              "id": 220771,
              "pid": 2207,
              "level": "district",
              "name": "吉林松原经济开发区"
            },
            {
              "id": 220781,
              "pid": 2207,
              "level": "district",
              "name": "扶余市"
            }
          ]
        },
        {
          "id": 2208,
          "pid": 22,
          "level": "city",
          "name": "白城市",
          "children": [
            {
              "id": 220802,
              "pid": 2208,
              "level": "district",
              "name": "洮北区"
            },
            {
              "id": 220821,
              "pid": 2208,
              "level": "district",
              "name": "镇赉县"
            },
            {
              "id": 220822,
              "pid": 2208,
              "level": "district",
              "name": "通榆县"
            },
            {
              "id": 220871,
              "pid": 2208,
              "level": "district",
              "name": "吉林白城经济开发区"
            },
            {
              "id": 220881,
              "pid": 2208,
              "level": "district",
              "name": "洮南市"
            },
            {
              "id": 220882,
              "pid": 2208,
              "level": "district",
              "name": "大安市"
            }
          ]
        },
        {
          "id": 2224,
          "pid": 22,
          "level": "city",
          "name": "延边朝鲜族自治州",
          "children": [
            {
              "id": 222401,
              "pid": 2224,
              "level": "district",
              "name": "延吉市"
            },
            {
              "id": 222402,
              "pid": 2224,
              "level": "district",
              "name": "图们市"
            },
            {
              "id": 222403,
              "pid": 2224,
              "level": "district",
              "name": "敦化市"
            },
            {
              "id": 222404,
              "pid": 2224,
              "level": "district",
              "name": "珲春市"
            },
            {
              "id": 222405,
              "pid": 2224,
              "level": "district",
              "name": "龙井市"
            },
            {
              "id": 222406,
              "pid": 2224,
              "level": "district",
              "name": "和龙市"
            },
            {
              "id": 222424,
              "pid": 2224,
              "level": "district",
              "name": "汪清县"
            },
            {
              "id": 222426,
              "pid": 2224,
              "level": "district",
              "name": "安图县"
            }
          ]
        }
      ]
    },
    {
      "id": 23,
      "pid": 0,
      "level": "province",
      "name": "黑龙江省",
      "children": [
        {
          "id": 2301,
          "pid": 23,
          "level": "city",
          "name": "哈尔滨市",
          "children": [
            {
              "id": 230102,
              "pid": 2301,
              "level": "district",
              "name": "道里区"
            },
            {
              "id": 230103,
              "pid": 2301,
              "level": "district",
              "name": "南岗区"
            },
            {
              "id": 230104,
              "pid": 2301,
              "level": "district",
              "name": "道外区"
            },
            {
              "id": 230108,
              "pid": 2301,
              "level": "district",
              "name": "平房区"
            },
            {
              "id": 230109,
              "pid": 2301,
              "level": "district",
              "name": "松北区"
            },
            {
              "id": 230110,
              "pid": 2301,
              "level": "district",
              "name": "香坊区"
            },
            {
              "id": 230111,
              "pid": 2301,
              "level": "district",
              "name": "呼兰区"
            },
            {
              "id": 230112,
              "pid": 2301,
              "level": "district",
              "name": "阿城区"
            },
            {
              "id": 230113,
              "pid": 2301,
              "level": "district",
              "name": "双城区"
            },
            {
              "id": 230123,
              "pid": 2301,
              "level": "district",
              "name": "依兰县"
            },
            {
              "id": 230124,
              "pid": 2301,
              "level": "district",
              "name": "方正县"
            },
            {
              "id": 230125,
              "pid": 2301,
              "level": "district",
              "name": "宾县"
            },
            {
              "id": 230126,
              "pid": 2301,
              "level": "district",
              "name": "巴彦县"
            },
            {
              "id": 230127,
              "pid": 2301,
              "level": "district",
              "name": "木兰县"
            },
            {
              "id": 230128,
              "pid": 2301,
              "level": "district",
              "name": "通河县"
            },
            {
              "id": 230129,
              "pid": 2301,
              "level": "district",
              "name": "延寿县"
            },
            {
              "id": 230183,
              "pid": 2301,
              "level": "district",
              "name": "尚志市"
            },
            {
              "id": 230184,
              "pid": 2301,
              "level": "district",
              "name": "五常市"
            }
          ]
        },
        {
          "id": 2302,
          "pid": 23,
          "level": "city",
          "name": "齐齐哈尔市",
          "children": [
            {
              "id": 230202,
              "pid": 2302,
              "level": "district",
              "name": "龙沙区"
            },
            {
              "id": 230203,
              "pid": 2302,
              "level": "district",
              "name": "建华区"
            },
            {
              "id": 230204,
              "pid": 2302,
              "level": "district",
              "name": "铁锋区"
            },
            {
              "id": 230205,
              "pid": 2302,
              "level": "district",
              "name": "昂昂溪区"
            },
            {
              "id": 230206,
              "pid": 2302,
              "level": "district",
              "name": "富拉尔基区"
            },
            {
              "id": 230207,
              "pid": 2302,
              "level": "district",
              "name": "碾子山区"
            },
            {
              "id": 230208,
              "pid": 2302,
              "level": "district",
              "name": "梅里斯达斡尔族区"
            },
            {
              "id": 230221,
              "pid": 2302,
              "level": "district",
              "name": "龙江县"
            },
            {
              "id": 230223,
              "pid": 2302,
              "level": "district",
              "name": "依安县"
            },
            {
              "id": 230224,
              "pid": 2302,
              "level": "district",
              "name": "泰来县"
            },
            {
              "id": 230225,
              "pid": 2302,
              "level": "district",
              "name": "甘南县"
            },
            {
              "id": 230227,
              "pid": 2302,
              "level": "district",
              "name": "富裕县"
            },
            {
              "id": 230229,
              "pid": 2302,
              "level": "district",
              "name": "克山县"
            },
            {
              "id": 230230,
              "pid": 2302,
              "level": "district",
              "name": "克东县"
            },
            {
              "id": 230231,
              "pid": 2302,
              "level": "district",
              "name": "拜泉县"
            },
            {
              "id": 230281,
              "pid": 2302,
              "level": "district",
              "name": "讷河市"
            }
          ]
        },
        {
          "id": 2303,
          "pid": 23,
          "level": "city",
          "name": "鸡西市",
          "children": [
            {
              "id": 230302,
              "pid": 2303,
              "level": "district",
              "name": "鸡冠区"
            },
            {
              "id": 230303,
              "pid": 2303,
              "level": "district",
              "name": "恒山区"
            },
            {
              "id": 230304,
              "pid": 2303,
              "level": "district",
              "name": "滴道区"
            },
            {
              "id": 230305,
              "pid": 2303,
              "level": "district",
              "name": "梨树区"
            },
            {
              "id": 230306,
              "pid": 2303,
              "level": "district",
              "name": "城子河区"
            },
            {
              "id": 230307,
              "pid": 2303,
              "level": "district",
              "name": "麻山区"
            },
            {
              "id": 230321,
              "pid": 2303,
              "level": "district",
              "name": "鸡东县"
            },
            {
              "id": 230381,
              "pid": 2303,
              "level": "district",
              "name": "虎林市"
            },
            {
              "id": 230382,
              "pid": 2303,
              "level": "district",
              "name": "密山市"
            }
          ]
        },
        {
          "id": 2304,
          "pid": 23,
          "level": "city",
          "name": "鹤岗市",
          "children": [
            {
              "id": 230402,
              "pid": 2304,
              "level": "district",
              "name": "向阳区"
            },
            {
              "id": 230403,
              "pid": 2304,
              "level": "district",
              "name": "工农区"
            },
            {
              "id": 230404,
              "pid": 2304,
              "level": "district",
              "name": "南山区"
            },
            {
              "id": 230405,
              "pid": 2304,
              "level": "district",
              "name": "兴安区"
            },
            {
              "id": 230406,
              "pid": 2304,
              "level": "district",
              "name": "东山区"
            },
            {
              "id": 230407,
              "pid": 2304,
              "level": "district",
              "name": "兴山区"
            },
            {
              "id": 230421,
              "pid": 2304,
              "level": "district",
              "name": "萝北县"
            },
            {
              "id": 230422,
              "pid": 2304,
              "level": "district",
              "name": "绥滨县"
            }
          ]
        },
        {
          "id": 2305,
          "pid": 23,
          "level": "city",
          "name": "双鸭山市",
          "children": [
            {
              "id": 230502,
              "pid": 2305,
              "level": "district",
              "name": "尖山区"
            },
            {
              "id": 230503,
              "pid": 2305,
              "level": "district",
              "name": "岭东区"
            },
            {
              "id": 230505,
              "pid": 2305,
              "level": "district",
              "name": "四方台区"
            },
            {
              "id": 230506,
              "pid": 2305,
              "level": "district",
              "name": "宝山区"
            },
            {
              "id": 230521,
              "pid": 2305,
              "level": "district",
              "name": "集贤县"
            },
            {
              "id": 230522,
              "pid": 2305,
              "level": "district",
              "name": "友谊县"
            },
            {
              "id": 230523,
              "pid": 2305,
              "level": "district",
              "name": "宝清县"
            },
            {
              "id": 230524,
              "pid": 2305,
              "level": "district",
              "name": "饶河县"
            }
          ]
        },
        {
          "id": 2306,
          "pid": 23,
          "level": "city",
          "name": "大庆市",
          "children": [
            {
              "id": 230602,
              "pid": 2306,
              "level": "district",
              "name": "萨尔图区"
            },
            {
              "id": 230603,
              "pid": 2306,
              "level": "district",
              "name": "龙凤区"
            },
            {
              "id": 230604,
              "pid": 2306,
              "level": "district",
              "name": "让胡路区"
            },
            {
              "id": 230605,
              "pid": 2306,
              "level": "district",
              "name": "红岗区"
            },
            {
              "id": 230606,
              "pid": 2306,
              "level": "district",
              "name": "大同区"
            },
            {
              "id": 230621,
              "pid": 2306,
              "level": "district",
              "name": "肇州县"
            },
            {
              "id": 230622,
              "pid": 2306,
              "level": "district",
              "name": "肇源县"
            },
            {
              "id": 230623,
              "pid": 2306,
              "level": "district",
              "name": "林甸县"
            },
            {
              "id": 230624,
              "pid": 2306,
              "level": "district",
              "name": "杜尔伯特蒙古族自治县"
            },
            {
              "id": 230671,
              "pid": 2306,
              "level": "district",
              "name": "大庆高新技术产业开发区"
            }
          ]
        },
        {
          "id": 2307,
          "pid": 23,
          "level": "city",
          "name": "伊春市",
          "children": [
            {
              "id": 230717,
              "pid": 2307,
              "level": "district",
              "name": "伊美区"
            },
            {
              "id": 230718,
              "pid": 2307,
              "level": "district",
              "name": "乌翠区"
            },
            {
              "id": 230719,
              "pid": 2307,
              "level": "district",
              "name": "友好区"
            },
            {
              "id": 230722,
              "pid": 2307,
              "level": "district",
              "name": "嘉荫县"
            },
            {
              "id": 230723,
              "pid": 2307,
              "level": "district",
              "name": "汤旺县"
            },
            {
              "id": 230724,
              "pid": 2307,
              "level": "district",
              "name": "丰林县"
            },
            {
              "id": 230725,
              "pid": 2307,
              "level": "district",
              "name": "大箐山县"
            },
            {
              "id": 230726,
              "pid": 2307,
              "level": "district",
              "name": "南岔县"
            },
            {
              "id": 230751,
              "pid": 2307,
              "level": "district",
              "name": "金林区"
            },
            {
              "id": 230781,
              "pid": 2307,
              "level": "district",
              "name": "铁力市"
            }
          ]
        },
        {
          "id": 2308,
          "pid": 23,
          "level": "city",
          "name": "佳木斯市",
          "children": [
            {
              "id": 230803,
              "pid": 2308,
              "level": "district",
              "name": "向阳区"
            },
            {
              "id": 230804,
              "pid": 2308,
              "level": "district",
              "name": "前进区"
            },
            {
              "id": 230805,
              "pid": 2308,
              "level": "district",
              "name": "东风区"
            },
            {
              "id": 230811,
              "pid": 2308,
              "level": "district",
              "name": "郊区"
            },
            {
              "id": 230822,
              "pid": 2308,
              "level": "district",
              "name": "桦南县"
            },
            {
              "id": 230826,
              "pid": 2308,
              "level": "district",
              "name": "桦川县"
            },
            {
              "id": 230828,
              "pid": 2308,
              "level": "district",
              "name": "汤原县"
            },
            {
              "id": 230881,
              "pid": 2308,
              "level": "district",
              "name": "同江市"
            },
            {
              "id": 230882,
              "pid": 2308,
              "level": "district",
              "name": "富锦市"
            },
            {
              "id": 230883,
              "pid": 2308,
              "level": "district",
              "name": "抚远市"
            }
          ]
        },
        {
          "id": 2309,
          "pid": 23,
          "level": "city",
          "name": "七台河市",
          "children": [
            {
              "id": 230902,
              "pid": 2309,
              "level": "district",
              "name": "新兴区"
            },
            {
              "id": 230903,
              "pid": 2309,
              "level": "district",
              "name": "桃山区"
            },
            {
              "id": 230904,
              "pid": 2309,
              "level": "district",
              "name": "茄子河区"
            },
            {
              "id": 230921,
              "pid": 2309,
              "level": "district",
              "name": "勃利县"
            }
          ]
        },
        {
          "id": 2310,
          "pid": 23,
          "level": "city",
          "name": "牡丹江市",
          "children": [
            {
              "id": 231002,
              "pid": 2310,
              "level": "district",
              "name": "东安区"
            },
            {
              "id": 231003,
              "pid": 2310,
              "level": "district",
              "name": "阳明区"
            },
            {
              "id": 231004,
              "pid": 2310,
              "level": "district",
              "name": "爱民区"
            },
            {
              "id": 231005,
              "pid": 2310,
              "level": "district",
              "name": "西安区"
            },
            {
              "id": 231025,
              "pid": 2310,
              "level": "district",
              "name": "林口县"
            },
            {
              "id": 231071,
              "pid": 2310,
              "level": "district",
              "name": "牡丹江经济技术开发区"
            },
            {
              "id": 231081,
              "pid": 2310,
              "level": "district",
              "name": "绥芬河市"
            },
            {
              "id": 231083,
              "pid": 2310,
              "level": "district",
              "name": "海林市"
            },
            {
              "id": 231084,
              "pid": 2310,
              "level": "district",
              "name": "宁安市"
            },
            {
              "id": 231085,
              "pid": 2310,
              "level": "district",
              "name": "穆棱市"
            },
            {
              "id": 231086,
              "pid": 2310,
              "level": "district",
              "name": "东宁市"
            }
          ]
        },
        {
          "id": 2311,
          "pid": 23,
          "level": "city",
          "name": "黑河市",
          "children": [
            {
              "id": 231102,
              "pid": 2311,
              "level": "district",
              "name": "爱辉区"
            },
            {
              "id": 231123,
              "pid": 2311,
              "level": "district",
              "name": "逊克县"
            },
            {
              "id": 231124,
              "pid": 2311,
              "level": "district",
              "name": "孙吴县"
            },
            {
              "id": 231181,
              "pid": 2311,
              "level": "district",
              "name": "北安市"
            },
            {
              "id": 231182,
              "pid": 2311,
              "level": "district",
              "name": "五大连池市"
            },
            {
              "id": 231183,
              "pid": 2311,
              "level": "district",
              "name": "嫩江市"
            }
          ]
        },
        {
          "id": 2312,
          "pid": 23,
          "level": "city",
          "name": "绥化市",
          "children": [
            {
              "id": 231202,
              "pid": 2312,
              "level": "district",
              "name": "北林区"
            },
            {
              "id": 231221,
              "pid": 2312,
              "level": "district",
              "name": "望奎县"
            },
            {
              "id": 231222,
              "pid": 2312,
              "level": "district",
              "name": "兰西县"
            },
            {
              "id": 231223,
              "pid": 2312,
              "level": "district",
              "name": "青冈县"
            },
            {
              "id": 231224,
              "pid": 2312,
              "level": "district",
              "name": "庆安县"
            },
            {
              "id": 231225,
              "pid": 2312,
              "level": "district",
              "name": "明水县"
            },
            {
              "id": 231226,
              "pid": 2312,
              "level": "district",
              "name": "绥棱县"
            },
            {
              "id": 231281,
              "pid": 2312,
              "level": "district",
              "name": "安达市"
            },
            {
              "id": 231282,
              "pid": 2312,
              "level": "district",
              "name": "肇东市"
            },
            {
              "id": 231283,
              "pid": 2312,
              "level": "district",
              "name": "海伦市"
            }
          ]
        },
        {
          "id": 2327,
          "pid": 23,
          "level": "city",
          "name": "大兴安岭地区",
          "children": [
            {
              "id": 232701,
              "pid": 2327,
              "level": "district",
              "name": "漠河市"
            },
            {
              "id": 232721,
              "pid": 2327,
              "level": "district",
              "name": "呼玛县"
            },
            {
              "id": 232722,
              "pid": 2327,
              "level": "district",
              "name": "塔河县"
            },
            {
              "id": 232761,
              "pid": 2327,
              "level": "district",
              "name": "加格达奇区"
            },
            {
              "id": 232762,
              "pid": 2327,
              "level": "district",
              "name": "松岭区"
            },
            {
              "id": 232763,
              "pid": 2327,
              "level": "district",
              "name": "新林区"
            },
            {
              "id": 232764,
              "pid": 2327,
              "level": "district",
              "name": "呼中区"
            }
          ]
        }
      ]
    },
    {
      "id": 31,
      "pid": 0,
      "level": "province",
      "name": "上海市",
      "children": [
        {
          "id": 3101,
          "pid": 31,
          "level": "city",
          "name": "市辖区",
          "children": [
            {
              "id": 310101,
              "pid": 3101,
              "level": "district",
              "name": "黄浦区"
            },
            {
              "id": 310104,
              "pid": 3101,
              "level": "district",
              "name": "徐汇区"
            },
            {
              "id": 310105,
              "pid": 3101,
              "level": "district",
              "name": "长宁区"
            },
            {
              "id": 310106,
              "pid": 3101,
              "level": "district",
              "name": "静安区"
            },
            {
              "id": 310107,
              "pid": 3101,
              "level": "district",
              "name": "普陀区"
            },
            {
              "id": 310109,
              "pid": 3101,
              "level": "district",
              "name": "虹口区"
            },
            {
              "id": 310110,
              "pid": 3101,
              "level": "district",
              "name": "杨浦区"
            },
            {
              "id": 310112,
              "pid": 3101,
              "level": "district",
              "name": "闵行区"
            },
            {
              "id": 310113,
              "pid": 3101,
              "level": "district",
              "name": "宝山区"
            },
            {
              "id": 310114,
              "pid": 3101,
              "level": "district",
              "name": "嘉定区"
            },
            {
              "id": 310115,
              "pid": 3101,
              "level": "district",
              "name": "浦东新区"
            },
            {
              "id": 310116,
              "pid": 3101,
              "level": "district",
              "name": "金山区"
            },
            {
              "id": 310117,
              "pid": 3101,
              "level": "district",
              "name": "松江区"
            },
            {
              "id": 310118,
              "pid": 3101,
              "level": "district",
              "name": "青浦区"
            },
            {
              "id": 310120,
              "pid": 3101,
              "level": "district",
              "name": "奉贤区"
            },
            {
              "id": 310151,
              "pid": 3101,
              "level": "district",
              "name": "崇明区"
            }
          ]
        }
      ]
    },
    {
      "id": 32,
      "pid": 0,
      "level": "province",
      "name": "江苏省",
      "children": [
        {
          "id": 3201,
          "pid": 32,
          "level": "city",
          "name": "南京市",
          "children": [
            {
              "id": 320102,
              "pid": 3201,
              "level": "district",
              "name": "玄武区"
            },
            {
              "id": 320104,
              "pid": 3201,
              "level": "district",
              "name": "秦淮区"
            },
            {
              "id": 320105,
              "pid": 3201,
              "level": "district",
              "name": "建邺区"
            },
            {
              "id": 320106,
              "pid": 3201,
              "level": "district",
              "name": "鼓楼区"
            },
            {
              "id": 320111,
              "pid": 3201,
              "level": "district",
              "name": "浦口区"
            },
            {
              "id": 320113,
              "pid": 3201,
              "level": "district",
              "name": "栖霞区"
            },
            {
              "id": 320114,
              "pid": 3201,
              "level": "district",
              "name": "雨花台区"
            },
            {
              "id": 320115,
              "pid": 3201,
              "level": "district",
              "name": "江宁区"
            },
            {
              "id": 320116,
              "pid": 3201,
              "level": "district",
              "name": "六合区"
            },
            {
              "id": 320117,
              "pid": 3201,
              "level": "district",
              "name": "溧水区"
            },
            {
              "id": 320118,
              "pid": 3201,
              "level": "district",
              "name": "高淳区"
            }
          ]
        },
        {
          "id": 3202,
          "pid": 32,
          "level": "city",
          "name": "无锡市",
          "children": [
            {
              "id": 320205,
              "pid": 3202,
              "level": "district",
              "name": "锡山区"
            },
            {
              "id": 320206,
              "pid": 3202,
              "level": "district",
              "name": "惠山区"
            },
            {
              "id": 320211,
              "pid": 3202,
              "level": "district",
              "name": "滨湖区"
            },
            {
              "id": 320213,
              "pid": 3202,
              "level": "district",
              "name": "梁溪区"
            },
            {
              "id": 320214,
              "pid": 3202,
              "level": "district",
              "name": "新吴区"
            },
            {
              "id": 320281,
              "pid": 3202,
              "level": "district",
              "name": "江阴市"
            },
            {
              "id": 320282,
              "pid": 3202,
              "level": "district",
              "name": "宜兴市"
            }
          ]
        },
        {
          "id": 3203,
          "pid": 32,
          "level": "city",
          "name": "徐州市",
          "children": [
            {
              "id": 320302,
              "pid": 3203,
              "level": "district",
              "name": "鼓楼区"
            },
            {
              "id": 320303,
              "pid": 3203,
              "level": "district",
              "name": "云龙区"
            },
            {
              "id": 320305,
              "pid": 3203,
              "level": "district",
              "name": "贾汪区"
            },
            {
              "id": 320311,
              "pid": 3203,
              "level": "district",
              "name": "泉山区"
            },
            {
              "id": 320312,
              "pid": 3203,
              "level": "district",
              "name": "铜山区"
            },
            {
              "id": 320321,
              "pid": 3203,
              "level": "district",
              "name": "丰县"
            },
            {
              "id": 320322,
              "pid": 3203,
              "level": "district",
              "name": "沛县"
            },
            {
              "id": 320324,
              "pid": 3203,
              "level": "district",
              "name": "睢宁县"
            },
            {
              "id": 320371,
              "pid": 3203,
              "level": "district",
              "name": "徐州经济技术开发区"
            },
            {
              "id": 320381,
              "pid": 3203,
              "level": "district",
              "name": "新沂市"
            },
            {
              "id": 320382,
              "pid": 3203,
              "level": "district",
              "name": "邳州市"
            }
          ]
        },
        {
          "id": 3204,
          "pid": 32,
          "level": "city",
          "name": "常州市",
          "children": [
            {
              "id": 320402,
              "pid": 3204,
              "level": "district",
              "name": "天宁区"
            },
            {
              "id": 320404,
              "pid": 3204,
              "level": "district",
              "name": "钟楼区"
            },
            {
              "id": 320411,
              "pid": 3204,
              "level": "district",
              "name": "新北区"
            },
            {
              "id": 320412,
              "pid": 3204,
              "level": "district",
              "name": "武进区"
            },
            {
              "id": 320413,
              "pid": 3204,
              "level": "district",
              "name": "金坛区"
            },
            {
              "id": 320481,
              "pid": 3204,
              "level": "district",
              "name": "溧阳市"
            }
          ]
        },
        {
          "id": 3205,
          "pid": 32,
          "level": "city",
          "name": "苏州市",
          "children": [
            {
              "id": 320505,
              "pid": 3205,
              "level": "district",
              "name": "虎丘区"
            },
            {
              "id": 320506,
              "pid": 3205,
              "level": "district",
              "name": "吴中区"
            },
            {
              "id": 320507,
              "pid": 3205,
              "level": "district",
              "name": "相城区"
            },
            {
              "id": 320508,
              "pid": 3205,
              "level": "district",
              "name": "姑苏区"
            },
            {
              "id": 320509,
              "pid": 3205,
              "level": "district",
              "name": "吴江区"
            },
            {
              "id": 320571,
              "pid": 3205,
              "level": "district",
              "name": "苏州工业园区"
            },
            {
              "id": 320581,
              "pid": 3205,
              "level": "district",
              "name": "常熟市"
            },
            {
              "id": 320582,
              "pid": 3205,
              "level": "district",
              "name": "张家港市"
            },
            {
              "id": 320583,
              "pid": 3205,
              "level": "district",
              "name": "昆山市"
            },
            {
              "id": 320585,
              "pid": 3205,
              "level": "district",
              "name": "太仓市"
            }
          ]
        },
        {
          "id": 3206,
          "pid": 32,
          "level": "city",
          "name": "南通市",
          "children": [
            {
              "id": 320612,
              "pid": 3206,
              "level": "district",
              "name": "通州区"
            },
            {
              "id": 320613,
              "pid": 3206,
              "level": "district",
              "name": "崇川区"
            },
            {
              "id": 320614,
              "pid": 3206,
              "level": "district",
              "name": "海门区"
            },
            {
              "id": 320623,
              "pid": 3206,
              "level": "district",
              "name": "如东县"
            },
            {
              "id": 320671,
              "pid": 3206,
              "level": "district",
              "name": "南通经济技术开发区"
            },
            {
              "id": 320681,
              "pid": 3206,
              "level": "district",
              "name": "启东市"
            },
            {
              "id": 320682,
              "pid": 3206,
              "level": "district",
              "name": "如皋市"
            },
            {
              "id": 320685,
              "pid": 3206,
              "level": "district",
              "name": "海安市"
            }
          ]
        },
        {
          "id": 3207,
          "pid": 32,
          "level": "city",
          "name": "连云港市",
          "children": [
            {
              "id": 320703,
              "pid": 3207,
              "level": "district",
              "name": "连云区"
            },
            {
              "id": 320706,
              "pid": 3207,
              "level": "district",
              "name": "海州区"
            },
            {
              "id": 320707,
              "pid": 3207,
              "level": "district",
              "name": "赣榆区"
            },
            {
              "id": 320722,
              "pid": 3207,
              "level": "district",
              "name": "东海县"
            },
            {
              "id": 320723,
              "pid": 3207,
              "level": "district",
              "name": "灌云县"
            },
            {
              "id": 320724,
              "pid": 3207,
              "level": "district",
              "name": "灌南县"
            },
            {
              "id": 320771,
              "pid": 3207,
              "level": "district",
              "name": "连云港经济技术开发区"
            },
            {
              "id": 320772,
              "pid": 3207,
              "level": "district",
              "name": "连云港高新技术产业开发区"
            }
          ]
        },
        {
          "id": 3208,
          "pid": 32,
          "level": "city",
          "name": "淮安市",
          "children": [
            {
              "id": 320803,
              "pid": 3208,
              "level": "district",
              "name": "淮安区"
            },
            {
              "id": 320804,
              "pid": 3208,
              "level": "district",
              "name": "淮阴区"
            },
            {
              "id": 320812,
              "pid": 3208,
              "level": "district",
              "name": "清江浦区"
            },
            {
              "id": 320813,
              "pid": 3208,
              "level": "district",
              "name": "洪泽区"
            },
            {
              "id": 320826,
              "pid": 3208,
              "level": "district",
              "name": "涟水县"
            },
            {
              "id": 320830,
              "pid": 3208,
              "level": "district",
              "name": "盱眙县"
            },
            {
              "id": 320831,
              "pid": 3208,
              "level": "district",
              "name": "金湖县"
            },
            {
              "id": 320871,
              "pid": 3208,
              "level": "district",
              "name": "淮安经济技术开发区"
            }
          ]
        },
        {
          "id": 3209,
          "pid": 32,
          "level": "city",
          "name": "盐城市",
          "children": [
            {
              "id": 320902,
              "pid": 3209,
              "level": "district",
              "name": "亭湖区"
            },
            {
              "id": 320903,
              "pid": 3209,
              "level": "district",
              "name": "盐都区"
            },
            {
              "id": 320904,
              "pid": 3209,
              "level": "district",
              "name": "大丰区"
            },
            {
              "id": 320921,
              "pid": 3209,
              "level": "district",
              "name": "响水县"
            },
            {
              "id": 320922,
              "pid": 3209,
              "level": "district",
              "name": "滨海县"
            },
            {
              "id": 320923,
              "pid": 3209,
              "level": "district",
              "name": "阜宁县"
            },
            {
              "id": 320924,
              "pid": 3209,
              "level": "district",
              "name": "射阳县"
            },
            {
              "id": 320925,
              "pid": 3209,
              "level": "district",
              "name": "建湖县"
            },
            {
              "id": 320971,
              "pid": 3209,
              "level": "district",
              "name": "盐城经济技术开发区"
            },
            {
              "id": 320981,
              "pid": 3209,
              "level": "district",
              "name": "东台市"
            }
          ]
        },
        {
          "id": 3210,
          "pid": 32,
          "level": "city",
          "name": "扬州市",
          "children": [
            {
              "id": 321002,
              "pid": 3210,
              "level": "district",
              "name": "广陵区"
            },
            {
              "id": 321003,
              "pid": 3210,
              "level": "district",
              "name": "邗江区"
            },
            {
              "id": 321012,
              "pid": 3210,
              "level": "district",
              "name": "江都区"
            },
            {
              "id": 321023,
              "pid": 3210,
              "level": "district",
              "name": "宝应县"
            },
            {
              "id": 321071,
              "pid": 3210,
              "level": "district",
              "name": "扬州经济技术开发区"
            },
            {
              "id": 321081,
              "pid": 3210,
              "level": "district",
              "name": "仪征市"
            },
            {
              "id": 321084,
              "pid": 3210,
              "level": "district",
              "name": "高邮市"
            }
          ]
        },
        {
          "id": 3211,
          "pid": 32,
          "level": "city",
          "name": "镇江市",
          "children": [
            {
              "id": 321102,
              "pid": 3211,
              "level": "district",
              "name": "京口区"
            },
            {
              "id": 321111,
              "pid": 3211,
              "level": "district",
              "name": "润州区"
            },
            {
              "id": 321112,
              "pid": 3211,
              "level": "district",
              "name": "丹徒区"
            },
            {
              "id": 321171,
              "pid": 3211,
              "level": "district",
              "name": "镇江新区"
            },
            {
              "id": 321181,
              "pid": 3211,
              "level": "district",
              "name": "丹阳市"
            },
            {
              "id": 321182,
              "pid": 3211,
              "level": "district",
              "name": "扬中市"
            },
            {
              "id": 321183,
              "pid": 3211,
              "level": "district",
              "name": "句容市"
            }
          ]
        },
        {
          "id": 3212,
          "pid": 32,
          "level": "city",
          "name": "泰州市",
          "children": [
            {
              "id": 321202,
              "pid": 3212,
              "level": "district",
              "name": "海陵区"
            },
            {
              "id": 321203,
              "pid": 3212,
              "level": "district",
              "name": "高港区"
            },
            {
              "id": 321204,
              "pid": 3212,
              "level": "district",
              "name": "姜堰区"
            },
            {
              "id": 321271,
              "pid": 3212,
              "level": "district",
              "name": "泰州医药高新技术产业开发区"
            },
            {
              "id": 321281,
              "pid": 3212,
              "level": "district",
              "name": "兴化市"
            },
            {
              "id": 321282,
              "pid": 3212,
              "level": "district",
              "name": "靖江市"
            },
            {
              "id": 321283,
              "pid": 3212,
              "level": "district",
              "name": "泰兴市"
            }
          ]
        },
        {
          "id": 3213,
          "pid": 32,
          "level": "city",
          "name": "宿迁市",
          "children": [
            {
              "id": 321302,
              "pid": 3213,
              "level": "district",
              "name": "宿城区"
            },
            {
              "id": 321311,
              "pid": 3213,
              "level": "district",
              "name": "宿豫区"
            },
            {
              "id": 321322,
              "pid": 3213,
              "level": "district",
              "name": "沭阳县"
            },
            {
              "id": 321323,
              "pid": 3213,
              "level": "district",
              "name": "泗阳县"
            },
            {
              "id": 321324,
              "pid": 3213,
              "level": "district",
              "name": "泗洪县"
            },
            {
              "id": 321371,
              "pid": 3213,
              "level": "district",
              "name": "宿迁经济技术开发区"
            }
          ]
        }
      ]
    },
    {
      "id": 33,
      "pid": 0,
      "level": "province",
      "name": "浙江省",
      "children": [
        {
          "id": 3301,
          "pid": 33,
          "level": "city",
          "name": "杭州市",
          "children": [
            {
              "id": 330102,
              "pid": 3301,
              "level": "district",
              "name": "上城区"
            },
            {
              "id": 330105,
              "pid": 3301,
              "level": "district",
              "name": "拱墅区"
            },
            {
              "id": 330106,
              "pid": 3301,
              "level": "district",
              "name": "西湖区"
            },
            {
              "id": 330108,
              "pid": 3301,
              "level": "district",
              "name": "滨江区"
            },
            {
              "id": 330109,
              "pid": 3301,
              "level": "district",
              "name": "萧山区"
            },
            {
              "id": 330110,
              "pid": 3301,
              "level": "district",
              "name": "余杭区"
            },
            {
              "id": 330111,
              "pid": 3301,
              "level": "district",
              "name": "富阳区"
            },
            {
              "id": 330112,
              "pid": 3301,
              "level": "district",
              "name": "临安区"
            },
            {
              "id": 330113,
              "pid": 3301,
              "level": "district",
              "name": "临平区"
            },
            {
              "id": 330114,
              "pid": 3301,
              "level": "district",
              "name": "钱塘区"
            },
            {
              "id": 330122,
              "pid": 3301,
              "level": "district",
              "name": "桐庐县"
            },
            {
              "id": 330127,
              "pid": 3301,
              "level": "district",
              "name": "淳安县"
            },
            {
              "id": 330182,
              "pid": 3301,
              "level": "district",
              "name": "建德市"
            }
          ]
        },
        {
          "id": 3302,
          "pid": 33,
          "level": "city",
          "name": "宁波市",
          "children": [
            {
              "id": 330203,
              "pid": 3302,
              "level": "district",
              "name": "海曙区"
            },
            {
              "id": 330205,
              "pid": 3302,
              "level": "district",
              "name": "江北区"
            },
            {
              "id": 330206,
              "pid": 3302,
              "level": "district",
              "name": "北仑区"
            },
            {
              "id": 330211,
              "pid": 3302,
              "level": "district",
              "name": "镇海区"
            },
            {
              "id": 330212,
              "pid": 3302,
              "level": "district",
              "name": "鄞州区"
            },
            {
              "id": 330213,
              "pid": 3302,
              "level": "district",
              "name": "奉化区"
            },
            {
              "id": 330225,
              "pid": 3302,
              "level": "district",
              "name": "象山县"
            },
            {
              "id": 330226,
              "pid": 3302,
              "level": "district",
              "name": "宁海县"
            },
            {
              "id": 330281,
              "pid": 3302,
              "level": "district",
              "name": "余姚市"
            },
            {
              "id": 330282,
              "pid": 3302,
              "level": "district",
              "name": "慈溪市"
            }
          ]
        },
        {
          "id": 3303,
          "pid": 33,
          "level": "city",
          "name": "温州市",
          "children": [
            {
              "id": 330302,
              "pid": 3303,
              "level": "district",
              "name": "鹿城区"
            },
            {
              "id": 330303,
              "pid": 3303,
              "level": "district",
              "name": "龙湾区"
            },
            {
              "id": 330304,
              "pid": 3303,
              "level": "district",
              "name": "瓯海区"
            },
            {
              "id": 330305,
              "pid": 3303,
              "level": "district",
              "name": "洞头区"
            },
            {
              "id": 330324,
              "pid": 3303,
              "level": "district",
              "name": "永嘉县"
            },
            {
              "id": 330326,
              "pid": 3303,
              "level": "district",
              "name": "平阳县"
            },
            {
              "id": 330327,
              "pid": 3303,
              "level": "district",
              "name": "苍南县"
            },
            {
              "id": 330328,
              "pid": 3303,
              "level": "district",
              "name": "文成县"
            },
            {
              "id": 330329,
              "pid": 3303,
              "level": "district",
              "name": "泰顺县"
            },
            {
              "id": 330371,
              "pid": 3303,
              "level": "district",
              "name": "温州经济技术开发区"
            },
            {
              "id": 330381,
              "pid": 3303,
              "level": "district",
              "name": "瑞安市"
            },
            {
              "id": 330382,
              "pid": 3303,
              "level": "district",
              "name": "乐清市"
            },
            {
              "id": 330383,
              "pid": 3303,
              "level": "district",
              "name": "龙港市"
            }
          ]
        },
        {
          "id": 3304,
          "pid": 33,
          "level": "city",
          "name": "嘉兴市",
          "children": [
            {
              "id": 330402,
              "pid": 3304,
              "level": "district",
              "name": "南湖区"
            },
            {
              "id": 330411,
              "pid": 3304,
              "level": "district",
              "name": "秀洲区"
            },
            {
              "id": 330421,
              "pid": 3304,
              "level": "district",
              "name": "嘉善县"
            },
            {
              "id": 330424,
              "pid": 3304,
              "level": "district",
              "name": "海盐县"
            },
            {
              "id": 330481,
              "pid": 3304,
              "level": "district",
              "name": "海宁市"
            },
            {
              "id": 330482,
              "pid": 3304,
              "level": "district",
              "name": "平湖市"
            },
            {
              "id": 330483,
              "pid": 3304,
              "level": "district",
              "name": "桐乡市"
            }
          ]
        },
        {
          "id": 3305,
          "pid": 33,
          "level": "city",
          "name": "湖州市",
          "children": [
            {
              "id": 330502,
              "pid": 3305,
              "level": "district",
              "name": "吴兴区"
            },
            {
              "id": 330503,
              "pid": 3305,
              "level": "district",
              "name": "南浔区"
            },
            {
              "id": 330521,
              "pid": 3305,
              "level": "district",
              "name": "德清县"
            },
            {
              "id": 330522,
              "pid": 3305,
              "level": "district",
              "name": "长兴县"
            },
            {
              "id": 330523,
              "pid": 3305,
              "level": "district",
              "name": "安吉县"
            }
          ]
        },
        {
          "id": 3306,
          "pid": 33,
          "level": "city",
          "name": "绍兴市",
          "children": [
            {
              "id": 330602,
              "pid": 3306,
              "level": "district",
              "name": "越城区"
            },
            {
              "id": 330603,
              "pid": 3306,
              "level": "district",
              "name": "柯桥区"
            },
            {
              "id": 330604,
              "pid": 3306,
              "level": "district",
              "name": "上虞区"
            },
            {
              "id": 330624,
              "pid": 3306,
              "level": "district",
              "name": "新昌县"
            },
            {
              "id": 330681,
              "pid": 3306,
              "level": "district",
              "name": "诸暨市"
            },
            {
              "id": 330683,
              "pid": 3306,
              "level": "district",
              "name": "嵊州市"
            }
          ]
        },
        {
          "id": 3307,
          "pid": 33,
          "level": "city",
          "name": "金华市",
          "children": [
            {
              "id": 330702,
              "pid": 3307,
              "level": "district",
              "name": "婺城区"
            },
            {
              "id": 330703,
              "pid": 3307,
              "level": "district",
              "name": "金东区"
            },
            {
              "id": 330723,
              "pid": 3307,
              "level": "district",
              "name": "武义县"
            },
            {
              "id": 330726,
              "pid": 3307,
              "level": "district",
              "name": "浦江县"
            },
            {
              "id": 330727,
              "pid": 3307,
              "level": "district",
              "name": "磐安县"
            },
            {
              "id": 330781,
              "pid": 3307,
              "level": "district",
              "name": "兰溪市"
            },
            {
              "id": 330782,
              "pid": 3307,
              "level": "district",
              "name": "义乌市"
            },
            {
              "id": 330783,
              "pid": 3307,
              "level": "district",
              "name": "东阳市"
            },
            {
              "id": 330784,
              "pid": 3307,
              "level": "district",
              "name": "永康市"
            }
          ]
        },
        {
          "id": 3308,
          "pid": 33,
          "level": "city",
          "name": "衢州市",
          "children": [
            {
              "id": 330802,
              "pid": 3308,
              "level": "district",
              "name": "柯城区"
            },
            {
              "id": 330803,
              "pid": 3308,
              "level": "district",
              "name": "衢江区"
            },
            {
              "id": 330822,
              "pid": 3308,
              "level": "district",
              "name": "常山县"
            },
            {
              "id": 330824,
              "pid": 3308,
              "level": "district",
              "name": "开化县"
            },
            {
              "id": 330825,
              "pid": 3308,
              "level": "district",
              "name": "龙游县"
            },
            {
              "id": 330881,
              "pid": 3308,
              "level": "district",
              "name": "江山市"
            }
          ]
        },
        {
          "id": 3309,
          "pid": 33,
          "level": "city",
          "name": "舟山市",
          "children": [
            {
              "id": 330902,
              "pid": 3309,
              "level": "district",
              "name": "定海区"
            },
            {
              "id": 330903,
              "pid": 3309,
              "level": "district",
              "name": "普陀区"
            },
            {
              "id": 330921,
              "pid": 3309,
              "level": "district",
              "name": "岱山县"
            },
            {
              "id": 330922,
              "pid": 3309,
              "level": "district",
              "name": "嵊泗县"
            }
          ]
        },
        {
          "id": 3310,
          "pid": 33,
          "level": "city",
          "name": "台州市",
          "children": [
            {
              "id": 331002,
              "pid": 3310,
              "level": "district",
              "name": "椒江区"
            },
            {
              "id": 331003,
              "pid": 3310,
              "level": "district",
              "name": "黄岩区"
            },
            {
              "id": 331004,
              "pid": 3310,
              "level": "district",
              "name": "路桥区"
            },
            {
              "id": 331022,
              "pid": 3310,
              "level": "district",
              "name": "三门县"
            },
            {
              "id": 331023,
              "pid": 3310,
              "level": "district",
              "name": "天台县"
            },
            {
              "id": 331024,
              "pid": 3310,
              "level": "district",
              "name": "仙居县"
            },
            {
              "id": 331081,
              "pid": 3310,
              "level": "district",
              "name": "温岭市"
            },
            {
              "id": 331082,
              "pid": 3310,
              "level": "district",
              "name": "临海市"
            },
            {
              "id": 331083,
              "pid": 3310,
              "level": "district",
              "name": "玉环市"
            }
          ]
        },
        {
          "id": 3311,
          "pid": 33,
          "level": "city",
          "name": "丽水市",
          "children": [
            {
              "id": 331102,
              "pid": 3311,
              "level": "district",
              "name": "莲都区"
            },
            {
              "id": 331121,
              "pid": 3311,
              "level": "district",
              "name": "青田县"
            },
            {
              "id": 331122,
              "pid": 3311,
              "level": "district",
              "name": "缙云县"
            },
            {
              "id": 331123,
              "pid": 3311,
              "level": "district",
              "name": "遂昌县"
            },
            {
              "id": 331124,
              "pid": 3311,
              "level": "district",
              "name": "松阳县"
            },
            {
              "id": 331125,
              "pid": 3311,
              "level": "district",
              "name": "云和县"
            },
            {
              "id": 331126,
              "pid": 3311,
              "level": "district",
              "name": "庆元县"
            },
            {
              "id": 331127,
              "pid": 3311,
              "level": "district",
              "name": "景宁畲族自治县"
            },
            {
              "id": 331181,
              "pid": 3311,
              "level": "district",
              "name": "龙泉市"
            }
          ]
        }
      ]
    },
    {
      "id": 34,
      "pid": 0,
      "level": "province",
      "name": "安徽省",
      "children": [
        {
          "id": 3401,
          "pid": 34,
          "level": "city",
          "name": "合肥市",
          "children": [
            {
              "id": 340102,
              "pid": 3401,
              "level": "district",
              "name": "瑶海区"
            },
            {
              "id": 340103,
              "pid": 3401,
              "level": "district",
              "name": "庐阳区"
            },
            {
              "id": 340104,
              "pid": 3401,
              "level": "district",
              "name": "蜀山区"
            },
            {
              "id": 340111,
              "pid": 3401,
              "level": "district",
              "name": "包河区"
            },
            {
              "id": 340121,
              "pid": 3401,
              "level": "district",
              "name": "长丰县"
            },
            {
              "id": 340122,
              "pid": 3401,
              "level": "district",
              "name": "肥东县"
            },
            {
              "id": 340123,
              "pid": 3401,
              "level": "district",
              "name": "肥西县"
            },
            {
              "id": 340124,
              "pid": 3401,
              "level": "district",
              "name": "庐江县"
            },
            {
              "id": 340171,
              "pid": 3401,
              "level": "district",
              "name": "合肥高新技术产业开发区"
            },
            {
              "id": 340172,
              "pid": 3401,
              "level": "district",
              "name": "合肥经济技术开发区"
            },
            {
              "id": 340173,
              "pid": 3401,
              "level": "district",
              "name": "合肥新站高新技术产业开发区"
            },
            {
              "id": 340181,
              "pid": 3401,
              "level": "district",
              "name": "巢湖市"
            }
          ]
        },
        {
          "id": 3402,
          "pid": 34,
          "level": "city",
          "name": "芜湖市",
          "children": [
            {
              "id": 340202,
              "pid": 3402,
              "level": "district",
              "name": "镜湖区"
            },
            {
              "id": 340207,
              "pid": 3402,
              "level": "district",
              "name": "鸠江区"
            },
            {
              "id": 340209,
              "pid": 3402,
              "level": "district",
              "name": "弋江区"
            },
            {
              "id": 340210,
              "pid": 3402,
              "level": "district",
              "name": "湾沚区"
            },
            {
              "id": 340212,
              "pid": 3402,
              "level": "district",
              "name": "繁昌区"
            },
            {
              "id": 340223,
              "pid": 3402,
              "level": "district",
              "name": "南陵县"
            },
            {
              "id": 340271,
              "pid": 3402,
              "level": "district",
              "name": "芜湖经济技术开发区"
            },
            {
              "id": 340272,
              "pid": 3402,
              "level": "district",
              "name": "安徽芜湖三山经济开发区"
            },
            {
              "id": 340281,
              "pid": 3402,
              "level": "district",
              "name": "无为市"
            }
          ]
        },
        {
          "id": 3403,
          "pid": 34,
          "level": "city",
          "name": "蚌埠市",
          "children": [
            {
              "id": 340302,
              "pid": 3403,
              "level": "district",
              "name": "龙子湖区"
            },
            {
              "id": 340303,
              "pid": 3403,
              "level": "district",
              "name": "蚌山区"
            },
            {
              "id": 340304,
              "pid": 3403,
              "level": "district",
              "name": "禹会区"
            },
            {
              "id": 340311,
              "pid": 3403,
              "level": "district",
              "name": "淮上区"
            },
            {
              "id": 340321,
              "pid": 3403,
              "level": "district",
              "name": "怀远县"
            },
            {
              "id": 340322,
              "pid": 3403,
              "level": "district",
              "name": "五河县"
            },
            {
              "id": 340323,
              "pid": 3403,
              "level": "district",
              "name": "固镇县"
            },
            {
              "id": 340371,
              "pid": 3403,
              "level": "district",
              "name": "蚌埠市高新技术开发区"
            },
            {
              "id": 340372,
              "pid": 3403,
              "level": "district",
              "name": "蚌埠市经济开发区"
            }
          ]
        },
        {
          "id": 3404,
          "pid": 34,
          "level": "city",
          "name": "淮南市",
          "children": [
            {
              "id": 340402,
              "pid": 3404,
              "level": "district",
              "name": "大通区"
            },
            {
              "id": 340403,
              "pid": 3404,
              "level": "district",
              "name": "田家庵区"
            },
            {
              "id": 340404,
              "pid": 3404,
              "level": "district",
              "name": "谢家集区"
            },
            {
              "id": 340405,
              "pid": 3404,
              "level": "district",
              "name": "八公山区"
            },
            {
              "id": 340406,
              "pid": 3404,
              "level": "district",
              "name": "潘集区"
            },
            {
              "id": 340421,
              "pid": 3404,
              "level": "district",
              "name": "凤台县"
            },
            {
              "id": 340422,
              "pid": 3404,
              "level": "district",
              "name": "寿县"
            }
          ]
        },
        {
          "id": 3405,
          "pid": 34,
          "level": "city",
          "name": "马鞍山市",
          "children": [
            {
              "id": 340503,
              "pid": 3405,
              "level": "district",
              "name": "花山区"
            },
            {
              "id": 340504,
              "pid": 3405,
              "level": "district",
              "name": "雨山区"
            },
            {
              "id": 340506,
              "pid": 3405,
              "level": "district",
              "name": "博望区"
            },
            {
              "id": 340521,
              "pid": 3405,
              "level": "district",
              "name": "当涂县"
            },
            {
              "id": 340522,
              "pid": 3405,
              "level": "district",
              "name": "含山县"
            },
            {
              "id": 340523,
              "pid": 3405,
              "level": "district",
              "name": "和县"
            }
          ]
        },
        {
          "id": 3406,
          "pid": 34,
          "level": "city",
          "name": "淮北市",
          "children": [
            {
              "id": 340602,
              "pid": 3406,
              "level": "district",
              "name": "杜集区"
            },
            {
              "id": 340603,
              "pid": 3406,
              "level": "district",
              "name": "相山区"
            },
            {
              "id": 340604,
              "pid": 3406,
              "level": "district",
              "name": "烈山区"
            },
            {
              "id": 340621,
              "pid": 3406,
              "level": "district",
              "name": "濉溪县"
            }
          ]
        },
        {
          "id": 3407,
          "pid": 34,
          "level": "city",
          "name": "铜陵市",
          "children": [
            {
              "id": 340705,
              "pid": 3407,
              "level": "district",
              "name": "铜官区"
            },
            {
              "id": 340706,
              "pid": 3407,
              "level": "district",
              "name": "义安区"
            },
            {
              "id": 340711,
              "pid": 3407,
              "level": "district",
              "name": "郊区"
            },
            {
              "id": 340722,
              "pid": 3407,
              "level": "district",
              "name": "枞阳县"
            }
          ]
        },
        {
          "id": 3408,
          "pid": 34,
          "level": "city",
          "name": "安庆市",
          "children": [
            {
              "id": 340802,
              "pid": 3408,
              "level": "district",
              "name": "迎江区"
            },
            {
              "id": 340803,
              "pid": 3408,
              "level": "district",
              "name": "大观区"
            },
            {
              "id": 340811,
              "pid": 3408,
              "level": "district",
              "name": "宜秀区"
            },
            {
              "id": 340822,
              "pid": 3408,
              "level": "district",
              "name": "怀宁县"
            },
            {
              "id": 340825,
              "pid": 3408,
              "level": "district",
              "name": "太湖县"
            },
            {
              "id": 340826,
              "pid": 3408,
              "level": "district",
              "name": "宿松县"
            },
            {
              "id": 340827,
              "pid": 3408,
              "level": "district",
              "name": "望江县"
            },
            {
              "id": 340828,
              "pid": 3408,
              "level": "district",
              "name": "岳西县"
            },
            {
              "id": 340871,
              "pid": 3408,
              "level": "district",
              "name": "安徽安庆经济开发区"
            },
            {
              "id": 340881,
              "pid": 3408,
              "level": "district",
              "name": "桐城市"
            },
            {
              "id": 340882,
              "pid": 3408,
              "level": "district",
              "name": "潜山市"
            }
          ]
        },
        {
          "id": 3410,
          "pid": 34,
          "level": "city",
          "name": "黄山市",
          "children": [
            {
              "id": 341002,
              "pid": 3410,
              "level": "district",
              "name": "屯溪区"
            },
            {
              "id": 341003,
              "pid": 3410,
              "level": "district",
              "name": "黄山区"
            },
            {
              "id": 341004,
              "pid": 3410,
              "level": "district",
              "name": "徽州区"
            },
            {
              "id": 341021,
              "pid": 3410,
              "level": "district",
              "name": "歙县"
            },
            {
              "id": 341022,
              "pid": 3410,
              "level": "district",
              "name": "休宁县"
            },
            {
              "id": 341023,
              "pid": 3410,
              "level": "district",
              "name": "黟县"
            },
            {
              "id": 341024,
              "pid": 3410,
              "level": "district",
              "name": "祁门县"
            }
          ]
        },
        {
          "id": 3411,
          "pid": 34,
          "level": "city",
          "name": "滁州市",
          "children": [
            {
              "id": 341102,
              "pid": 3411,
              "level": "district",
              "name": "琅琊区"
            },
            {
              "id": 341103,
              "pid": 3411,
              "level": "district",
              "name": "南谯区"
            },
            {
              "id": 341122,
              "pid": 3411,
              "level": "district",
              "name": "来安县"
            },
            {
              "id": 341124,
              "pid": 3411,
              "level": "district",
              "name": "全椒县"
            },
            {
              "id": 341125,
              "pid": 3411,
              "level": "district",
              "name": "定远县"
            },
            {
              "id": 341126,
              "pid": 3411,
              "level": "district",
              "name": "凤阳县"
            },
            {
              "id": 341171,
              "pid": 3411,
              "level": "district",
              "name": "中新苏滁高新技术产业开发区"
            },
            {
              "id": 341172,
              "pid": 3411,
              "level": "district",
              "name": "滁州经济技术开发区"
            },
            {
              "id": 341181,
              "pid": 3411,
              "level": "district",
              "name": "天长市"
            },
            {
              "id": 341182,
              "pid": 3411,
              "level": "district",
              "name": "明光市"
            }
          ]
        },
        {
          "id": 3412,
          "pid": 34,
          "level": "city",
          "name": "阜阳市",
          "children": [
            {
              "id": 341202,
              "pid": 3412,
              "level": "district",
              "name": "颍州区"
            },
            {
              "id": 341203,
              "pid": 3412,
              "level": "district",
              "name": "颍东区"
            },
            {
              "id": 341204,
              "pid": 3412,
              "level": "district",
              "name": "颍泉区"
            },
            {
              "id": 341221,
              "pid": 3412,
              "level": "district",
              "name": "临泉县"
            },
            {
              "id": 341222,
              "pid": 3412,
              "level": "district",
              "name": "太和县"
            },
            {
              "id": 341225,
              "pid": 3412,
              "level": "district",
              "name": "阜南县"
            },
            {
              "id": 341226,
              "pid": 3412,
              "level": "district",
              "name": "颍上县"
            },
            {
              "id": 341271,
              "pid": 3412,
              "level": "district",
              "name": "阜阳合肥现代产业园区"
            },
            {
              "id": 341272,
              "pid": 3412,
              "level": "district",
              "name": "阜阳经济技术开发区"
            },
            {
              "id": 341282,
              "pid": 3412,
              "level": "district",
              "name": "界首市"
            }
          ]
        },
        {
          "id": 3413,
          "pid": 34,
          "level": "city",
          "name": "宿州市",
          "children": [
            {
              "id": 341302,
              "pid": 3413,
              "level": "district",
              "name": "埇桥区"
            },
            {
              "id": 341321,
              "pid": 3413,
              "level": "district",
              "name": "砀山县"
            },
            {
              "id": 341322,
              "pid": 3413,
              "level": "district",
              "name": "萧县"
            },
            {
              "id": 341323,
              "pid": 3413,
              "level": "district",
              "name": "灵璧县"
            },
            {
              "id": 341324,
              "pid": 3413,
              "level": "district",
              "name": "泗县"
            },
            {
              "id": 341371,
              "pid": 3413,
              "level": "district",
              "name": "宿州马鞍山现代产业园区"
            },
            {
              "id": 341372,
              "pid": 3413,
              "level": "district",
              "name": "宿州经济技术开发区"
            }
          ]
        },
        {
          "id": 3415,
          "pid": 34,
          "level": "city",
          "name": "六安市",
          "children": [
            {
              "id": 341502,
              "pid": 3415,
              "level": "district",
              "name": "金安区"
            },
            {
              "id": 341503,
              "pid": 3415,
              "level": "district",
              "name": "裕安区"
            },
            {
              "id": 341504,
              "pid": 3415,
              "level": "district",
              "name": "叶集区"
            },
            {
              "id": 341522,
              "pid": 3415,
              "level": "district",
              "name": "霍邱县"
            },
            {
              "id": 341523,
              "pid": 3415,
              "level": "district",
              "name": "舒城县"
            },
            {
              "id": 341524,
              "pid": 3415,
              "level": "district",
              "name": "金寨县"
            },
            {
              "id": 341525,
              "pid": 3415,
              "level": "district",
              "name": "霍山县"
            }
          ]
        },
        {
          "id": 3416,
          "pid": 34,
          "level": "city",
          "name": "亳州市",
          "children": [
            {
              "id": 341602,
              "pid": 3416,
              "level": "district",
              "name": "谯城区"
            },
            {
              "id": 341621,
              "pid": 3416,
              "level": "district",
              "name": "涡阳县"
            },
            {
              "id": 341622,
              "pid": 3416,
              "level": "district",
              "name": "蒙城县"
            },
            {
              "id": 341623,
              "pid": 3416,
              "level": "district",
              "name": "利辛县"
            }
          ]
        },
        {
          "id": 3417,
          "pid": 34,
          "level": "city",
          "name": "池州市",
          "children": [
            {
              "id": 341702,
              "pid": 3417,
              "level": "district",
              "name": "贵池区"
            },
            {
              "id": 341721,
              "pid": 3417,
              "level": "district",
              "name": "东至县"
            },
            {
              "id": 341722,
              "pid": 3417,
              "level": "district",
              "name": "石台县"
            },
            {
              "id": 341723,
              "pid": 3417,
              "level": "district",
              "name": "青阳县"
            }
          ]
        },
        {
          "id": 3418,
          "pid": 34,
          "level": "city",
          "name": "宣城市",
          "children": [
            {
              "id": 341802,
              "pid": 3418,
              "level": "district",
              "name": "宣州区"
            },
            {
              "id": 341821,
              "pid": 3418,
              "level": "district",
              "name": "郎溪县"
            },
            {
              "id": 341823,
              "pid": 3418,
              "level": "district",
              "name": "泾县"
            },
            {
              "id": 341824,
              "pid": 3418,
              "level": "district",
              "name": "绩溪县"
            },
            {
              "id": 341825,
              "pid": 3418,
              "level": "district",
              "name": "旌德县"
            },
            {
              "id": 341871,
              "pid": 3418,
              "level": "district",
              "name": "宣城市经济开发区"
            },
            {
              "id": 341881,
              "pid": 3418,
              "level": "district",
              "name": "宁国市"
            },
            {
              "id": 341882,
              "pid": 3418,
              "level": "district",
              "name": "广德市"
            }
          ]
        }
      ]
    },
    {
      "id": 35,
      "pid": 0,
      "level": "province",
      "name": "福建省",
      "children": [
        {
          "id": 3501,
          "pid": 35,
          "level": "city",
          "name": "福州市",
          "children": [
            {
              "id": 350102,
              "pid": 3501,
              "level": "district",
              "name": "鼓楼区"
            },
            {
              "id": 350103,
              "pid": 3501,
              "level": "district",
              "name": "台江区"
            },
            {
              "id": 350104,
              "pid": 3501,
              "level": "district",
              "name": "仓山区"
            },
            {
              "id": 350105,
              "pid": 3501,
              "level": "district",
              "name": "马尾区"
            },
            {
              "id": 350111,
              "pid": 3501,
              "level": "district",
              "name": "晋安区"
            },
            {
              "id": 350112,
              "pid": 3501,
              "level": "district",
              "name": "长乐区"
            },
            {
              "id": 350121,
              "pid": 3501,
              "level": "district",
              "name": "闽侯县"
            },
            {
              "id": 350122,
              "pid": 3501,
              "level": "district",
              "name": "连江县"
            },
            {
              "id": 350123,
              "pid": 3501,
              "level": "district",
              "name": "罗源县"
            },
            {
              "id": 350124,
              "pid": 3501,
              "level": "district",
              "name": "闽清县"
            },
            {
              "id": 350125,
              "pid": 3501,
              "level": "district",
              "name": "永泰县"
            },
            {
              "id": 350128,
              "pid": 3501,
              "level": "district",
              "name": "平潭县"
            },
            {
              "id": 350181,
              "pid": 3501,
              "level": "district",
              "name": "福清市"
            }
          ]
        },
        {
          "id": 3502,
          "pid": 35,
          "level": "city",
          "name": "厦门市",
          "children": [
            {
              "id": 350203,
              "pid": 3502,
              "level": "district",
              "name": "思明区"
            },
            {
              "id": 350205,
              "pid": 3502,
              "level": "district",
              "name": "海沧区"
            },
            {
              "id": 350206,
              "pid": 3502,
              "level": "district",
              "name": "湖里区"
            },
            {
              "id": 350211,
              "pid": 3502,
              "level": "district",
              "name": "集美区"
            },
            {
              "id": 350212,
              "pid": 3502,
              "level": "district",
              "name": "同安区"
            },
            {
              "id": 350213,
              "pid": 3502,
              "level": "district",
              "name": "翔安区"
            }
          ]
        },
        {
          "id": 3503,
          "pid": 35,
          "level": "city",
          "name": "莆田市",
          "children": [
            {
              "id": 350302,
              "pid": 3503,
              "level": "district",
              "name": "城厢区"
            },
            {
              "id": 350303,
              "pid": 3503,
              "level": "district",
              "name": "涵江区"
            },
            {
              "id": 350304,
              "pid": 3503,
              "level": "district",
              "name": "荔城区"
            },
            {
              "id": 350305,
              "pid": 3503,
              "level": "district",
              "name": "秀屿区"
            },
            {
              "id": 350322,
              "pid": 3503,
              "level": "district",
              "name": "仙游县"
            }
          ]
        },
        {
          "id": 3504,
          "pid": 35,
          "level": "city",
          "name": "三明市",
          "children": [
            {
              "id": 350404,
              "pid": 3504,
              "level": "district",
              "name": "三元区"
            },
            {
              "id": 350405,
              "pid": 3504,
              "level": "district",
              "name": "沙县区"
            },
            {
              "id": 350421,
              "pid": 3504,
              "level": "district",
              "name": "明溪县"
            },
            {
              "id": 350423,
              "pid": 3504,
              "level": "district",
              "name": "清流县"
            },
            {
              "id": 350424,
              "pid": 3504,
              "level": "district",
              "name": "宁化县"
            },
            {
              "id": 350425,
              "pid": 3504,
              "level": "district",
              "name": "大田县"
            },
            {
              "id": 350426,
              "pid": 3504,
              "level": "district",
              "name": "尤溪县"
            },
            {
              "id": 350428,
              "pid": 3504,
              "level": "district",
              "name": "将乐县"
            },
            {
              "id": 350429,
              "pid": 3504,
              "level": "district",
              "name": "泰宁县"
            },
            {
              "id": 350430,
              "pid": 3504,
              "level": "district",
              "name": "建宁县"
            },
            {
              "id": 350481,
              "pid": 3504,
              "level": "district",
              "name": "永安市"
            }
          ]
        },
        {
          "id": 3505,
          "pid": 35,
          "level": "city",
          "name": "泉州市",
          "children": [
            {
              "id": 350502,
              "pid": 3505,
              "level": "district",
              "name": "鲤城区"
            },
            {
              "id": 350503,
              "pid": 3505,
              "level": "district",
              "name": "丰泽区"
            },
            {
              "id": 350504,
              "pid": 3505,
              "level": "district",
              "name": "洛江区"
            },
            {
              "id": 350505,
              "pid": 3505,
              "level": "district",
              "name": "泉港区"
            },
            {
              "id": 350521,
              "pid": 3505,
              "level": "district",
              "name": "惠安县"
            },
            {
              "id": 350524,
              "pid": 3505,
              "level": "district",
              "name": "安溪县"
            },
            {
              "id": 350525,
              "pid": 3505,
              "level": "district",
              "name": "永春县"
            },
            {
              "id": 350526,
              "pid": 3505,
              "level": "district",
              "name": "德化县"
            },
            {
              "id": 350527,
              "pid": 3505,
              "level": "district",
              "name": "金门县"
            },
            {
              "id": 350581,
              "pid": 3505,
              "level": "district",
              "name": "石狮市"
            },
            {
              "id": 350582,
              "pid": 3505,
              "level": "district",
              "name": "晋江市"
            },
            {
              "id": 350583,
              "pid": 3505,
              "level": "district",
              "name": "南安市"
            }
          ]
        },
        {
          "id": 3506,
          "pid": 35,
          "level": "city",
          "name": "漳州市",
          "children": [
            {
              "id": 350602,
              "pid": 3506,
              "level": "district",
              "name": "芗城区"
            },
            {
              "id": 350603,
              "pid": 3506,
              "level": "district",
              "name": "龙文区"
            },
            {
              "id": 350604,
              "pid": 3506,
              "level": "district",
              "name": "龙海区"
            },
            {
              "id": 350605,
              "pid": 3506,
              "level": "district",
              "name": "长泰区"
            },
            {
              "id": 350622,
              "pid": 3506,
              "level": "district",
              "name": "云霄县"
            },
            {
              "id": 350623,
              "pid": 3506,
              "level": "district",
              "name": "漳浦县"
            },
            {
              "id": 350624,
              "pid": 3506,
              "level": "district",
              "name": "诏安县"
            },
            {
              "id": 350626,
              "pid": 3506,
              "level": "district",
              "name": "东山县"
            },
            {
              "id": 350627,
              "pid": 3506,
              "level": "district",
              "name": "南靖县"
            },
            {
              "id": 350628,
              "pid": 3506,
              "level": "district",
              "name": "平和县"
            },
            {
              "id": 350629,
              "pid": 3506,
              "level": "district",
              "name": "华安县"
            }
          ]
        },
        {
          "id": 3507,
          "pid": 35,
          "level": "city",
          "name": "南平市",
          "children": [
            {
              "id": 350702,
              "pid": 3507,
              "level": "district",
              "name": "延平区"
            },
            {
              "id": 350703,
              "pid": 3507,
              "level": "district",
              "name": "建阳区"
            },
            {
              "id": 350721,
              "pid": 3507,
              "level": "district",
              "name": "顺昌县"
            },
            {
              "id": 350722,
              "pid": 3507,
              "level": "district",
              "name": "浦城县"
            },
            {
              "id": 350723,
              "pid": 3507,
              "level": "district",
              "name": "光泽县"
            },
            {
              "id": 350724,
              "pid": 3507,
              "level": "district",
              "name": "松溪县"
            },
            {
              "id": 350725,
              "pid": 3507,
              "level": "district",
              "name": "政和县"
            },
            {
              "id": 350781,
              "pid": 3507,
              "level": "district",
              "name": "邵武市"
            },
            {
              "id": 350782,
              "pid": 3507,
              "level": "district",
              "name": "武夷山市"
            },
            {
              "id": 350783,
              "pid": 3507,
              "level": "district",
              "name": "建瓯市"
            }
          ]
        },
        {
          "id": 3508,
          "pid": 35,
          "level": "city",
          "name": "龙岩市",
          "children": [
            {
              "id": 350802,
              "pid": 3508,
              "level": "district",
              "name": "新罗区"
            },
            {
              "id": 350803,
              "pid": 3508,
              "level": "district",
              "name": "永定区"
            },
            {
              "id": 350821,
              "pid": 3508,
              "level": "district",
              "name": "长汀县"
            },
            {
              "id": 350823,
              "pid": 3508,
              "level": "district",
              "name": "上杭县"
            },
            {
              "id": 350824,
              "pid": 3508,
              "level": "district",
              "name": "武平县"
            },
            {
              "id": 350825,
              "pid": 3508,
              "level": "district",
              "name": "连城县"
            },
            {
              "id": 350881,
              "pid": 3508,
              "level": "district",
              "name": "漳平市"
            }
          ]
        },
        {
          "id": 3509,
          "pid": 35,
          "level": "city",
          "name": "宁德市",
          "children": [
            {
              "id": 350902,
              "pid": 3509,
              "level": "district",
              "name": "蕉城区"
            },
            {
              "id": 350921,
              "pid": 3509,
              "level": "district",
              "name": "霞浦县"
            },
            {
              "id": 350922,
              "pid": 3509,
              "level": "district",
              "name": "古田县"
            },
            {
              "id": 350923,
              "pid": 3509,
              "level": "district",
              "name": "屏南县"
            },
            {
              "id": 350924,
              "pid": 3509,
              "level": "district",
              "name": "寿宁县"
            },
            {
              "id": 350925,
              "pid": 3509,
              "level": "district",
              "name": "周宁县"
            },
            {
              "id": 350926,
              "pid": 3509,
              "level": "district",
              "name": "柘荣县"
            },
            {
              "id": 350981,
              "pid": 3509,
              "level": "district",
              "name": "福安市"
            },
            {
              "id": 350982,
              "pid": 3509,
              "level": "district",
              "name": "福鼎市"
            }
          ]
        }
      ]
    },
    {
      "id": 36,
      "pid": 0,
      "level": "province",
      "name": "江西省",
      "children": [
        {
          "id": 3601,
          "pid": 36,
          "level": "city",
          "name": "南昌市",
          "children": [
            {
              "id": 360102,
              "pid": 3601,
              "level": "district",
              "name": "东湖区"
            },
            {
              "id": 360103,
              "pid": 3601,
              "level": "district",
              "name": "西湖区"
            },
            {
              "id": 360104,
              "pid": 3601,
              "level": "district",
              "name": "青云谱区"
            },
            {
              "id": 360111,
              "pid": 3601,
              "level": "district",
              "name": "青山湖区"
            },
            {
              "id": 360112,
              "pid": 3601,
              "level": "district",
              "name": "新建区"
            },
            {
              "id": 360113,
              "pid": 3601,
              "level": "district",
              "name": "红谷滩区"
            },
            {
              "id": 360121,
              "pid": 3601,
              "level": "district",
              "name": "南昌县"
            },
            {
              "id": 360123,
              "pid": 3601,
              "level": "district",
              "name": "安义县"
            },
            {
              "id": 360124,
              "pid": 3601,
              "level": "district",
              "name": "进贤县"
            }
          ]
        },
        {
          "id": 3602,
          "pid": 36,
          "level": "city",
          "name": "景德镇市",
          "children": [
            {
              "id": 360202,
              "pid": 3602,
              "level": "district",
              "name": "昌江区"
            },
            {
              "id": 360203,
              "pid": 3602,
              "level": "district",
              "name": "珠山区"
            },
            {
              "id": 360222,
              "pid": 3602,
              "level": "district",
              "name": "浮梁县"
            },
            {
              "id": 360281,
              "pid": 3602,
              "level": "district",
              "name": "乐平市"
            }
          ]
        },
        {
          "id": 3603,
          "pid": 36,
          "level": "city",
          "name": "萍乡市",
          "children": [
            {
              "id": 360302,
              "pid": 3603,
              "level": "district",
              "name": "安源区"
            },
            {
              "id": 360313,
              "pid": 3603,
              "level": "district",
              "name": "湘东区"
            },
            {
              "id": 360321,
              "pid": 3603,
              "level": "district",
              "name": "莲花县"
            },
            {
              "id": 360322,
              "pid": 3603,
              "level": "district",
              "name": "上栗县"
            },
            {
              "id": 360323,
              "pid": 3603,
              "level": "district",
              "name": "芦溪县"
            }
          ]
        },
        {
          "id": 3604,
          "pid": 36,
          "level": "city",
          "name": "九江市",
          "children": [
            {
              "id": 360402,
              "pid": 3604,
              "level": "district",
              "name": "濂溪区"
            },
            {
              "id": 360403,
              "pid": 3604,
              "level": "district",
              "name": "浔阳区"
            },
            {
              "id": 360404,
              "pid": 3604,
              "level": "district",
              "name": "柴桑区"
            },
            {
              "id": 360423,
              "pid": 3604,
              "level": "district",
              "name": "武宁县"
            },
            {
              "id": 360424,
              "pid": 3604,
              "level": "district",
              "name": "修水县"
            },
            {
              "id": 360425,
              "pid": 3604,
              "level": "district",
              "name": "永修县"
            },
            {
              "id": 360426,
              "pid": 3604,
              "level": "district",
              "name": "德安县"
            },
            {
              "id": 360428,
              "pid": 3604,
              "level": "district",
              "name": "都昌县"
            },
            {
              "id": 360429,
              "pid": 3604,
              "level": "district",
              "name": "湖口县"
            },
            {
              "id": 360430,
              "pid": 3604,
              "level": "district",
              "name": "彭泽县"
            },
            {
              "id": 360481,
              "pid": 3604,
              "level": "district",
              "name": "瑞昌市"
            },
            {
              "id": 360482,
              "pid": 3604,
              "level": "district",
              "name": "共青城市"
            },
            {
              "id": 360483,
              "pid": 3604,
              "level": "district",
              "name": "庐山市"
            }
          ]
        },
        {
          "id": 3605,
          "pid": 36,
          "level": "city",
          "name": "新余市",
          "children": [
            {
              "id": 360502,
              "pid": 3605,
              "level": "district",
              "name": "渝水区"
            },
            {
              "id": 360521,
              "pid": 3605,
              "level": "district",
              "name": "分宜县"
            }
          ]
        },
        {
          "id": 3606,
          "pid": 36,
          "level": "city",
          "name": "鹰潭市",
          "children": [
            {
              "id": 360602,
              "pid": 3606,
              "level": "district",
              "name": "月湖区"
            },
            {
              "id": 360603,
              "pid": 3606,
              "level": "district",
              "name": "余江区"
            },
            {
              "id": 360681,
              "pid": 3606,
              "level": "district",
              "name": "贵溪市"
            }
          ]
        },
        {
          "id": 3607,
          "pid": 36,
          "level": "city",
          "name": "赣州市",
          "children": [
            {
              "id": 360702,
              "pid": 3607,
              "level": "district",
              "name": "章贡区"
            },
            {
              "id": 360703,
              "pid": 3607,
              "level": "district",
              "name": "南康区"
            },
            {
              "id": 360704,
              "pid": 3607,
              "level": "district",
              "name": "赣县区"
            },
            {
              "id": 360722,
              "pid": 3607,
              "level": "district",
              "name": "信丰县"
            },
            {
              "id": 360723,
              "pid": 3607,
              "level": "district",
              "name": "大余县"
            },
            {
              "id": 360724,
              "pid": 3607,
              "level": "district",
              "name": "上犹县"
            },
            {
              "id": 360725,
              "pid": 3607,
              "level": "district",
              "name": "崇义县"
            },
            {
              "id": 360726,
              "pid": 3607,
              "level": "district",
              "name": "安远县"
            },
            {
              "id": 360728,
              "pid": 3607,
              "level": "district",
              "name": "定南县"
            },
            {
              "id": 360729,
              "pid": 3607,
              "level": "district",
              "name": "全南县"
            },
            {
              "id": 360730,
              "pid": 3607,
              "level": "district",
              "name": "宁都县"
            },
            {
              "id": 360731,
              "pid": 3607,
              "level": "district",
              "name": "于都县"
            },
            {
              "id": 360732,
              "pid": 3607,
              "level": "district",
              "name": "兴国县"
            },
            {
              "id": 360733,
              "pid": 3607,
              "level": "district",
              "name": "会昌县"
            },
            {
              "id": 360734,
              "pid": 3607,
              "level": "district",
              "name": "寻乌县"
            },
            {
              "id": 360735,
              "pid": 3607,
              "level": "district",
              "name": "石城县"
            },
            {
              "id": 360781,
              "pid": 3607,
              "level": "district",
              "name": "瑞金市"
            },
            {
              "id": 360783,
              "pid": 3607,
              "level": "district",
              "name": "龙南市"
            }
          ]
        },
        {
          "id": 3608,
          "pid": 36,
          "level": "city",
          "name": "吉安市",
          "children": [
            {
              "id": 360802,
              "pid": 3608,
              "level": "district",
              "name": "吉州区"
            },
            {
              "id": 360803,
              "pid": 3608,
              "level": "district",
              "name": "青原区"
            },
            {
              "id": 360821,
              "pid": 3608,
              "level": "district",
              "name": "吉安县"
            },
            {
              "id": 360822,
              "pid": 3608,
              "level": "district",
              "name": "吉水县"
            },
            {
              "id": 360823,
              "pid": 3608,
              "level": "district",
              "name": "峡江县"
            },
            {
              "id": 360824,
              "pid": 3608,
              "level": "district",
              "name": "新干县"
            },
            {
              "id": 360825,
              "pid": 3608,
              "level": "district",
              "name": "永丰县"
            },
            {
              "id": 360826,
              "pid": 3608,
              "level": "district",
              "name": "泰和县"
            },
            {
              "id": 360827,
              "pid": 3608,
              "level": "district",
              "name": "遂川县"
            },
            {
              "id": 360828,
              "pid": 3608,
              "level": "district",
              "name": "万安县"
            },
            {
              "id": 360829,
              "pid": 3608,
              "level": "district",
              "name": "安福县"
            },
            {
              "id": 360830,
              "pid": 3608,
              "level": "district",
              "name": "永新县"
            },
            {
              "id": 360881,
              "pid": 3608,
              "level": "district",
              "name": "井冈山市"
            }
          ]
        },
        {
          "id": 3609,
          "pid": 36,
          "level": "city",
          "name": "宜春市",
          "children": [
            {
              "id": 360902,
              "pid": 3609,
              "level": "district",
              "name": "袁州区"
            },
            {
              "id": 360921,
              "pid": 3609,
              "level": "district",
              "name": "奉新县"
            },
            {
              "id": 360922,
              "pid": 3609,
              "level": "district",
              "name": "万载县"
            },
            {
              "id": 360923,
              "pid": 3609,
              "level": "district",
              "name": "上高县"
            },
            {
              "id": 360924,
              "pid": 3609,
              "level": "district",
              "name": "宜丰县"
            },
            {
              "id": 360925,
              "pid": 3609,
              "level": "district",
              "name": "靖安县"
            },
            {
              "id": 360926,
              "pid": 3609,
              "level": "district",
              "name": "铜鼓县"
            },
            {
              "id": 360981,
              "pid": 3609,
              "level": "district",
              "name": "丰城市"
            },
            {
              "id": 360982,
              "pid": 3609,
              "level": "district",
              "name": "樟树市"
            },
            {
              "id": 360983,
              "pid": 3609,
              "level": "district",
              "name": "高安市"
            }
          ]
        },
        {
          "id": 3610,
          "pid": 36,
          "level": "city",
          "name": "抚州市",
          "children": [
            {
              "id": 361002,
              "pid": 3610,
              "level": "district",
              "name": "临川区"
            },
            {
              "id": 361003,
              "pid": 3610,
              "level": "district",
              "name": "东乡区"
            },
            {
              "id": 361021,
              "pid": 3610,
              "level": "district",
              "name": "南城县"
            },
            {
              "id": 361022,
              "pid": 3610,
              "level": "district",
              "name": "黎川县"
            },
            {
              "id": 361023,
              "pid": 3610,
              "level": "district",
              "name": "南丰县"
            },
            {
              "id": 361024,
              "pid": 3610,
              "level": "district",
              "name": "崇仁县"
            },
            {
              "id": 361025,
              "pid": 3610,
              "level": "district",
              "name": "乐安县"
            },
            {
              "id": 361026,
              "pid": 3610,
              "level": "district",
              "name": "宜黄县"
            },
            {
              "id": 361027,
              "pid": 3610,
              "level": "district",
              "name": "金溪县"
            },
            {
              "id": 361028,
              "pid": 3610,
              "level": "district",
              "name": "资溪县"
            },
            {
              "id": 361030,
              "pid": 3610,
              "level": "district",
              "name": "广昌县"
            }
          ]
        },
        {
          "id": 3611,
          "pid": 36,
          "level": "city",
          "name": "上饶市",
          "children": [
            {
              "id": 361102,
              "pid": 3611,
              "level": "district",
              "name": "信州区"
            },
            {
              "id": 361103,
              "pid": 3611,
              "level": "district",
              "name": "广丰区"
            },
            {
              "id": 361104,
              "pid": 3611,
              "level": "district",
              "name": "广信区"
            },
            {
              "id": 361123,
              "pid": 3611,
              "level": "district",
              "name": "玉山县"
            },
            {
              "id": 361124,
              "pid": 3611,
              "level": "district",
              "name": "铅山县"
            },
            {
              "id": 361125,
              "pid": 3611,
              "level": "district",
              "name": "横峰县"
            },
            {
              "id": 361126,
              "pid": 3611,
              "level": "district",
              "name": "弋阳县"
            },
            {
              "id": 361127,
              "pid": 3611,
              "level": "district",
              "name": "余干县"
            },
            {
              "id": 361128,
              "pid": 3611,
              "level": "district",
              "name": "鄱阳县"
            },
            {
              "id": 361129,
              "pid": 3611,
              "level": "district",
              "name": "万年县"
            },
            {
              "id": 361130,
              "pid": 3611,
              "level": "district",
              "name": "婺源县"
            },
            {
              "id": 361181,
              "pid": 3611,
              "level": "district",
              "name": "德兴市"
            }
          ]
        }
      ]
    },
    {
      "id": 37,
      "pid": 0,
      "level": "province",
      "name": "山东省",
      "children": [
        {
          "id": 3701,
          "pid": 37,
          "level": "city",
          "name": "济南市",
          "children": [
            {
              "id": 370102,
              "pid": 3701,
              "level": "district",
              "name": "历下区"
            },
            {
              "id": 370103,
              "pid": 3701,
              "level": "district",
              "name": "市中区"
            },
            {
              "id": 370104,
              "pid": 3701,
              "level": "district",
              "name": "槐荫区"
            },
            {
              "id": 370105,
              "pid": 3701,
              "level": "district",
              "name": "天桥区"
            },
            {
              "id": 370112,
              "pid": 3701,
              "level": "district",
              "name": "历城区"
            },
            {
              "id": 370113,
              "pid": 3701,
              "level": "district",
              "name": "长清区"
            },
            {
              "id": 370114,
              "pid": 3701,
              "level": "district",
              "name": "章丘区"
            },
            {
              "id": 370115,
              "pid": 3701,
              "level": "district",
              "name": "济阳区"
            },
            {
              "id": 370116,
              "pid": 3701,
              "level": "district",
              "name": "莱芜区"
            },
            {
              "id": 370117,
              "pid": 3701,
              "level": "district",
              "name": "钢城区"
            },
            {
              "id": 370124,
              "pid": 3701,
              "level": "district",
              "name": "平阴县"
            },
            {
              "id": 370126,
              "pid": 3701,
              "level": "district",
              "name": "商河县"
            },
            {
              "id": 370171,
              "pid": 3701,
              "level": "district",
              "name": "济南高新技术产业开发区"
            }
          ]
        },
        {
          "id": 3702,
          "pid": 37,
          "level": "city",
          "name": "青岛市",
          "children": [
            {
              "id": 370202,
              "pid": 3702,
              "level": "district",
              "name": "市南区"
            },
            {
              "id": 370203,
              "pid": 3702,
              "level": "district",
              "name": "市北区"
            },
            {
              "id": 370211,
              "pid": 3702,
              "level": "district",
              "name": "黄岛区"
            },
            {
              "id": 370212,
              "pid": 3702,
              "level": "district",
              "name": "崂山区"
            },
            {
              "id": 370213,
              "pid": 3702,
              "level": "district",
              "name": "李沧区"
            },
            {
              "id": 370214,
              "pid": 3702,
              "level": "district",
              "name": "城阳区"
            },
            {
              "id": 370215,
              "pid": 3702,
              "level": "district",
              "name": "即墨区"
            },
            {
              "id": 370271,
              "pid": 3702,
              "level": "district",
              "name": "青岛高新技术产业开发区"
            },
            {
              "id": 370281,
              "pid": 3702,
              "level": "district",
              "name": "胶州市"
            },
            {
              "id": 370283,
              "pid": 3702,
              "level": "district",
              "name": "平度市"
            },
            {
              "id": 370285,
              "pid": 3702,
              "level": "district",
              "name": "莱西市"
            }
          ]
        },
        {
          "id": 3703,
          "pid": 37,
          "level": "city",
          "name": "淄博市",
          "children": [
            {
              "id": 370302,
              "pid": 3703,
              "level": "district",
              "name": "淄川区"
            },
            {
              "id": 370303,
              "pid": 3703,
              "level": "district",
              "name": "张店区"
            },
            {
              "id": 370304,
              "pid": 3703,
              "level": "district",
              "name": "博山区"
            },
            {
              "id": 370305,
              "pid": 3703,
              "level": "district",
              "name": "临淄区"
            },
            {
              "id": 370306,
              "pid": 3703,
              "level": "district",
              "name": "周村区"
            },
            {
              "id": 370321,
              "pid": 3703,
              "level": "district",
              "name": "桓台县"
            },
            {
              "id": 370322,
              "pid": 3703,
              "level": "district",
              "name": "高青县"
            },
            {
              "id": 370323,
              "pid": 3703,
              "level": "district",
              "name": "沂源县"
            }
          ]
        },
        {
          "id": 3704,
          "pid": 37,
          "level": "city",
          "name": "枣庄市",
          "children": [
            {
              "id": 370402,
              "pid": 3704,
              "level": "district",
              "name": "市中区"
            },
            {
              "id": 370403,
              "pid": 3704,
              "level": "district",
              "name": "薛城区"
            },
            {
              "id": 370404,
              "pid": 3704,
              "level": "district",
              "name": "峄城区"
            },
            {
              "id": 370405,
              "pid": 3704,
              "level": "district",
              "name": "台儿庄区"
            },
            {
              "id": 370406,
              "pid": 3704,
              "level": "district",
              "name": "山亭区"
            },
            {
              "id": 370481,
              "pid": 3704,
              "level": "district",
              "name": "滕州市"
            }
          ]
        },
        {
          "id": 3705,
          "pid": 37,
          "level": "city",
          "name": "东营市",
          "children": [
            {
              "id": 370502,
              "pid": 3705,
              "level": "district",
              "name": "东营区"
            },
            {
              "id": 370503,
              "pid": 3705,
              "level": "district",
              "name": "河口区"
            },
            {
              "id": 370505,
              "pid": 3705,
              "level": "district",
              "name": "垦利区"
            },
            {
              "id": 370522,
              "pid": 3705,
              "level": "district",
              "name": "利津县"
            },
            {
              "id": 370523,
              "pid": 3705,
              "level": "district",
              "name": "广饶县"
            },
            {
              "id": 370571,
              "pid": 3705,
              "level": "district",
              "name": "东营经济技术开发区"
            },
            {
              "id": 370572,
              "pid": 3705,
              "level": "district",
              "name": "东营港经济开发区"
            }
          ]
        },
        {
          "id": 3706,
          "pid": 37,
          "level": "city",
          "name": "烟台市",
          "children": [
            {
              "id": 370602,
              "pid": 3706,
              "level": "district",
              "name": "芝罘区"
            },
            {
              "id": 370611,
              "pid": 3706,
              "level": "district",
              "name": "福山区"
            },
            {
              "id": 370612,
              "pid": 3706,
              "level": "district",
              "name": "牟平区"
            },
            {
              "id": 370613,
              "pid": 3706,
              "level": "district",
              "name": "莱山区"
            },
            {
              "id": 370614,
              "pid": 3706,
              "level": "district",
              "name": "蓬莱区"
            },
            {
              "id": 370671,
              "pid": 3706,
              "level": "district",
              "name": "烟台高新技术产业开发区"
            },
            {
              "id": 370672,
              "pid": 3706,
              "level": "district",
              "name": "烟台经济技术开发区"
            },
            {
              "id": 370681,
              "pid": 3706,
              "level": "district",
              "name": "龙口市"
            },
            {
              "id": 370682,
              "pid": 3706,
              "level": "district",
              "name": "莱阳市"
            },
            {
              "id": 370683,
              "pid": 3706,
              "level": "district",
              "name": "莱州市"
            },
            {
              "id": 370685,
              "pid": 3706,
              "level": "district",
              "name": "招远市"
            },
            {
              "id": 370686,
              "pid": 3706,
              "level": "district",
              "name": "栖霞市"
            },
            {
              "id": 370687,
              "pid": 3706,
              "level": "district",
              "name": "海阳市"
            }
          ]
        },
        {
          "id": 3707,
          "pid": 37,
          "level": "city",
          "name": "潍坊市",
          "children": [
            {
              "id": 370702,
              "pid": 3707,
              "level": "district",
              "name": "潍城区"
            },
            {
              "id": 370703,
              "pid": 3707,
              "level": "district",
              "name": "寒亭区"
            },
            {
              "id": 370704,
              "pid": 3707,
              "level": "district",
              "name": "坊子区"
            },
            {
              "id": 370705,
              "pid": 3707,
              "level": "district",
              "name": "奎文区"
            },
            {
              "id": 370724,
              "pid": 3707,
              "level": "district",
              "name": "临朐县"
            },
            {
              "id": 370725,
              "pid": 3707,
              "level": "district",
              "name": "昌乐县"
            },
            {
              "id": 370772,
              "pid": 3707,
              "level": "district",
              "name": "潍坊滨海经济技术开发区"
            },
            {
              "id": 370781,
              "pid": 3707,
              "level": "district",
              "name": "青州市"
            },
            {
              "id": 370782,
              "pid": 3707,
              "level": "district",
              "name": "诸城市"
            },
            {
              "id": 370783,
              "pid": 3707,
              "level": "district",
              "name": "寿光市"
            },
            {
              "id": 370784,
              "pid": 3707,
              "level": "district",
              "name": "安丘市"
            },
            {
              "id": 370785,
              "pid": 3707,
              "level": "district",
              "name": "高密市"
            },
            {
              "id": 370786,
              "pid": 3707,
              "level": "district",
              "name": "昌邑市"
            }
          ]
        },
        {
          "id": 3708,
          "pid": 37,
          "level": "city",
          "name": "济宁市",
          "children": [
            {
              "id": 370811,
              "pid": 3708,
              "level": "district",
              "name": "任城区"
            },
            {
              "id": 370812,
              "pid": 3708,
              "level": "district",
              "name": "兖州区"
            },
            {
              "id": 370826,
              "pid": 3708,
              "level": "district",
              "name": "微山县"
            },
            {
              "id": 370827,
              "pid": 3708,
              "level": "district",
              "name": "鱼台县"
            },
            {
              "id": 370828,
              "pid": 3708,
              "level": "district",
              "name": "金乡县"
            },
            {
              "id": 370829,
              "pid": 3708,
              "level": "district",
              "name": "嘉祥县"
            },
            {
              "id": 370830,
              "pid": 3708,
              "level": "district",
              "name": "汶上县"
            },
            {
              "id": 370831,
              "pid": 3708,
              "level": "district",
              "name": "泗水县"
            },
            {
              "id": 370832,
              "pid": 3708,
              "level": "district",
              "name": "梁山县"
            },
            {
              "id": 370871,
              "pid": 3708,
              "level": "district",
              "name": "济宁高新技术产业开发区"
            },
            {
              "id": 370881,
              "pid": 3708,
              "level": "district",
              "name": "曲阜市"
            },
            {
              "id": 370883,
              "pid": 3708,
              "level": "district",
              "name": "邹城市"
            }
          ]
        },
        {
          "id": 3709,
          "pid": 37,
          "level": "city",
          "name": "泰安市",
          "children": [
            {
              "id": 370902,
              "pid": 3709,
              "level": "district",
              "name": "泰山区"
            },
            {
              "id": 370911,
              "pid": 3709,
              "level": "district",
              "name": "岱岳区"
            },
            {
              "id": 370921,
              "pid": 3709,
              "level": "district",
              "name": "宁阳县"
            },
            {
              "id": 370923,
              "pid": 3709,
              "level": "district",
              "name": "东平县"
            },
            {
              "id": 370982,
              "pid": 3709,
              "level": "district",
              "name": "新泰市"
            },
            {
              "id": 370983,
              "pid": 3709,
              "level": "district",
              "name": "肥城市"
            }
          ]
        },
        {
          "id": 3710,
          "pid": 37,
          "level": "city",
          "name": "威海市",
          "children": [
            {
              "id": 371002,
              "pid": 3710,
              "level": "district",
              "name": "环翠区"
            },
            {
              "id": 371003,
              "pid": 3710,
              "level": "district",
              "name": "文登区"
            },
            {
              "id": 371071,
              "pid": 3710,
              "level": "district",
              "name": "威海火炬高技术产业开发区"
            },
            {
              "id": 371072,
              "pid": 3710,
              "level": "district",
              "name": "威海经济技术开发区"
            },
            {
              "id": 371073,
              "pid": 3710,
              "level": "district",
              "name": "威海临港经济技术开发区"
            },
            {
              "id": 371082,
              "pid": 3710,
              "level": "district",
              "name": "荣成市"
            },
            {
              "id": 371083,
              "pid": 3710,
              "level": "district",
              "name": "乳山市"
            }
          ]
        },
        {
          "id": 3711,
          "pid": 37,
          "level": "city",
          "name": "日照市",
          "children": [
            {
              "id": 371102,
              "pid": 3711,
              "level": "district",
              "name": "东港区"
            },
            {
              "id": 371103,
              "pid": 3711,
              "level": "district",
              "name": "岚山区"
            },
            {
              "id": 371121,
              "pid": 3711,
              "level": "district",
              "name": "五莲县"
            },
            {
              "id": 371122,
              "pid": 3711,
              "level": "district",
              "name": "莒县"
            },
            {
              "id": 371171,
              "pid": 3711,
              "level": "district",
              "name": "日照经济技术开发区"
            }
          ]
        },
        {
          "id": 3713,
          "pid": 37,
          "level": "city",
          "name": "临沂市",
          "children": [
            {
              "id": 371302,
              "pid": 3713,
              "level": "district",
              "name": "兰山区"
            },
            {
              "id": 371311,
              "pid": 3713,
              "level": "district",
              "name": "罗庄区"
            },
            {
              "id": 371312,
              "pid": 3713,
              "level": "district",
              "name": "河东区"
            },
            {
              "id": 371321,
              "pid": 3713,
              "level": "district",
              "name": "沂南县"
            },
            {
              "id": 371322,
              "pid": 3713,
              "level": "district",
              "name": "郯城县"
            },
            {
              "id": 371323,
              "pid": 3713,
              "level": "district",
              "name": "沂水县"
            },
            {
              "id": 371324,
              "pid": 3713,
              "level": "district",
              "name": "兰陵县"
            },
            {
              "id": 371325,
              "pid": 3713,
              "level": "district",
              "name": "费县"
            },
            {
              "id": 371326,
              "pid": 3713,
              "level": "district",
              "name": "平邑县"
            },
            {
              "id": 371327,
              "pid": 3713,
              "level": "district",
              "name": "莒南县"
            },
            {
              "id": 371328,
              "pid": 3713,
              "level": "district",
              "name": "蒙阴县"
            },
            {
              "id": 371329,
              "pid": 3713,
              "level": "district",
              "name": "临沭县"
            },
            {
              "id": 371371,
              "pid": 3713,
              "level": "district",
              "name": "临沂高新技术产业开发区"
            }
          ]
        },
        {
          "id": 3714,
          "pid": 37,
          "level": "city",
          "name": "德州市",
          "children": [
            {
              "id": 371402,
              "pid": 3714,
              "level": "district",
              "name": "德城区"
            },
            {
              "id": 371403,
              "pid": 3714,
              "level": "district",
              "name": "陵城区"
            },
            {
              "id": 371422,
              "pid": 3714,
              "level": "district",
              "name": "宁津县"
            },
            {
              "id": 371423,
              "pid": 3714,
              "level": "district",
              "name": "庆云县"
            },
            {
              "id": 371424,
              "pid": 3714,
              "level": "district",
              "name": "临邑县"
            },
            {
              "id": 371425,
              "pid": 3714,
              "level": "district",
              "name": "齐河县"
            },
            {
              "id": 371426,
              "pid": 3714,
              "level": "district",
              "name": "平原县"
            },
            {
              "id": 371427,
              "pid": 3714,
              "level": "district",
              "name": "夏津县"
            },
            {
              "id": 371428,
              "pid": 3714,
              "level": "district",
              "name": "武城县"
            },
            {
              "id": 371471,
              "pid": 3714,
              "level": "district",
              "name": "德州经济技术开发区"
            },
            {
              "id": 371472,
              "pid": 3714,
              "level": "district",
              "name": "德州运河经济开发区"
            },
            {
              "id": 371481,
              "pid": 3714,
              "level": "district",
              "name": "乐陵市"
            },
            {
              "id": 371482,
              "pid": 3714,
              "level": "district",
              "name": "禹城市"
            }
          ]
        },
        {
          "id": 3715,
          "pid": 37,
          "level": "city",
          "name": "聊城市",
          "children": [
            {
              "id": 371502,
              "pid": 3715,
              "level": "district",
              "name": "东昌府区"
            },
            {
              "id": 371503,
              "pid": 3715,
              "level": "district",
              "name": "茌平区"
            },
            {
              "id": 371521,
              "pid": 3715,
              "level": "district",
              "name": "阳谷县"
            },
            {
              "id": 371522,
              "pid": 3715,
              "level": "district",
              "name": "莘县"
            },
            {
              "id": 371524,
              "pid": 3715,
              "level": "district",
              "name": "东阿县"
            },
            {
              "id": 371525,
              "pid": 3715,
              "level": "district",
              "name": "冠县"
            },
            {
              "id": 371526,
              "pid": 3715,
              "level": "district",
              "name": "高唐县"
            },
            {
              "id": 371581,
              "pid": 3715,
              "level": "district",
              "name": "临清市"
            }
          ]
        },
        {
          "id": 3716,
          "pid": 37,
          "level": "city",
          "name": "滨州市",
          "children": [
            {
              "id": 371602,
              "pid": 3716,
              "level": "district",
              "name": "滨城区"
            },
            {
              "id": 371603,
              "pid": 3716,
              "level": "district",
              "name": "沾化区"
            },
            {
              "id": 371621,
              "pid": 3716,
              "level": "district",
              "name": "惠民县"
            },
            {
              "id": 371622,
              "pid": 3716,
              "level": "district",
              "name": "阳信县"
            },
            {
              "id": 371623,
              "pid": 3716,
              "level": "district",
              "name": "无棣县"
            },
            {
              "id": 371625,
              "pid": 3716,
              "level": "district",
              "name": "博兴县"
            },
            {
              "id": 371681,
              "pid": 3716,
              "level": "district",
              "name": "邹平市"
            }
          ]
        },
        {
          "id": 3717,
          "pid": 37,
          "level": "city",
          "name": "菏泽市",
          "children": [
            {
              "id": 371702,
              "pid": 3717,
              "level": "district",
              "name": "牡丹区"
            },
            {
              "id": 371703,
              "pid": 3717,
              "level": "district",
              "name": "定陶区"
            },
            {
              "id": 371721,
              "pid": 3717,
              "level": "district",
              "name": "曹县"
            },
            {
              "id": 371722,
              "pid": 3717,
              "level": "district",
              "name": "单县"
            },
            {
              "id": 371723,
              "pid": 3717,
              "level": "district",
              "name": "成武县"
            },
            {
              "id": 371724,
              "pid": 3717,
              "level": "district",
              "name": "巨野县"
            },
            {
              "id": 371725,
              "pid": 3717,
              "level": "district",
              "name": "郓城县"
            },
            {
              "id": 371726,
              "pid": 3717,
              "level": "district",
              "name": "鄄城县"
            },
            {
              "id": 371728,
              "pid": 3717,
              "level": "district",
              "name": "东明县"
            },
            {
              "id": 371771,
              "pid": 3717,
              "level": "district",
              "name": "菏泽经济技术开发区"
            },
            {
              "id": 371772,
              "pid": 3717,
              "level": "district",
              "name": "菏泽高新技术开发区"
            }
          ]
        }
      ]
    },
    {
      "id": 41,
      "pid": 0,
      "level": "province",
      "name": "河南省",
      "children": [
        {
          "id": 4101,
          "pid": 41,
          "level": "city",
          "name": "郑州市",
          "children": [
            {
              "id": 410102,
              "pid": 4101,
              "level": "district",
              "name": "中原区"
            },
            {
              "id": 410103,
              "pid": 4101,
              "level": "district",
              "name": "二七区"
            },
            {
              "id": 410104,
              "pid": 4101,
              "level": "district",
              "name": "管城回族区"
            },
            {
              "id": 410105,
              "pid": 4101,
              "level": "district",
              "name": "金水区"
            },
            {
              "id": 410106,
              "pid": 4101,
              "level": "district",
              "name": "上街区"
            },
            {
              "id": 410108,
              "pid": 4101,
              "level": "district",
              "name": "惠济区"
            },
            {
              "id": 410122,
              "pid": 4101,
              "level": "district",
              "name": "中牟县"
            },
            {
              "id": 410170,
              "pid": 4101,
              "level": "district",
              "name": "郑东新区"
            },
            {
              "id": 410171,
              "pid": 4101,
              "level": "district",
              "name": "郑州经济技术开发区"
            },
            {
              "id": 410172,
              "pid": 4101,
              "level": "district",
              "name": "郑州高新技术产业开发区"
            },
            {
              "id": 410173,
              "pid": 4101,
              "level": "district",
              "name": "郑州航空港经济综合实验区"
            },
            {
              "id": 410181,
              "pid": 4101,
              "level": "district",
              "name": "巩义市"
            },
            {
              "id": 410182,
              "pid": 4101,
              "level": "district",
              "name": "荥阳市"
            },
            {
              "id": 410183,
              "pid": 4101,
              "level": "district",
              "name": "新密市"
            },
            {
              "id": 410184,
              "pid": 4101,
              "level": "district",
              "name": "新郑市"
            },
            {
              "id": 410185,
              "pid": 4101,
              "level": "district",
              "name": "登封市"
            }
          ]
        },
        {
          "id": 4102,
          "pid": 41,
          "level": "city",
          "name": "开封市",
          "children": [
            {
              "id": 410202,
              "pid": 4102,
              "level": "district",
              "name": "龙亭区"
            },
            {
              "id": 410203,
              "pid": 4102,
              "level": "district",
              "name": "顺河回族区"
            },
            {
              "id": 410204,
              "pid": 4102,
              "level": "district",
              "name": "鼓楼区"
            },
            {
              "id": 410205,
              "pid": 4102,
              "level": "district",
              "name": "禹王台区"
            },
            {
              "id": 410212,
              "pid": 4102,
              "level": "district",
              "name": "祥符区"
            },
            {
              "id": 410221,
              "pid": 4102,
              "level": "district",
              "name": "杞县"
            },
            {
              "id": 410222,
              "pid": 4102,
              "level": "district",
              "name": "通许县"
            },
            {
              "id": 410223,
              "pid": 4102,
              "level": "district",
              "name": "尉氏县"
            },
            {
              "id": 410225,
              "pid": 4102,
              "level": "district",
              "name": "兰考县"
            }
          ]
        },
        {
          "id": 4103,
          "pid": 41,
          "level": "city",
          "name": "洛阳市",
          "children": [
            {
              "id": 410302,
              "pid": 4103,
              "level": "district",
              "name": "老城区"
            },
            {
              "id": 410303,
              "pid": 4103,
              "level": "district",
              "name": "西工区"
            },
            {
              "id": 410304,
              "pid": 4103,
              "level": "district",
              "name": "瀍河回族区"
            },
            {
              "id": 410305,
              "pid": 4103,
              "level": "district",
              "name": "涧西区"
            },
            {
              "id": 410307,
              "pid": 4103,
              "level": "district",
              "name": "偃师区"
            },
            {
              "id": 410308,
              "pid": 4103,
              "level": "district",
              "name": "孟津区"
            },
            {
              "id": 410311,
              "pid": 4103,
              "level": "district",
              "name": "洛龙区"
            },
            {
              "id": 410323,
              "pid": 4103,
              "level": "district",
              "name": "新安县"
            },
            {
              "id": 410324,
              "pid": 4103,
              "level": "district",
              "name": "栾川县"
            },
            {
              "id": 410325,
              "pid": 4103,
              "level": "district",
              "name": "嵩县"
            },
            {
              "id": 410326,
              "pid": 4103,
              "level": "district",
              "name": "汝阳县"
            },
            {
              "id": 410327,
              "pid": 4103,
              "level": "district",
              "name": "宜阳县"
            },
            {
              "id": 410328,
              "pid": 4103,
              "level": "district",
              "name": "洛宁县"
            },
            {
              "id": 410329,
              "pid": 4103,
              "level": "district",
              "name": "伊川县"
            },
            {
              "id": 410371,
              "pid": 4103,
              "level": "district",
              "name": "洛阳高新技术产业开发区"
            }
          ]
        },
        {
          "id": 4104,
          "pid": 41,
          "level": "city",
          "name": "平顶山市",
          "children": [
            {
              "id": 410402,
              "pid": 4104,
              "level": "district",
              "name": "新华区"
            },
            {
              "id": 410403,
              "pid": 4104,
              "level": "district",
              "name": "卫东区"
            },
            {
              "id": 410404,
              "pid": 4104,
              "level": "district",
              "name": "石龙区"
            },
            {
              "id": 410411,
              "pid": 4104,
              "level": "district",
              "name": "湛河区"
            },
            {
              "id": 410421,
              "pid": 4104,
              "level": "district",
              "name": "宝丰县"
            },
            {
              "id": 410422,
              "pid": 4104,
              "level": "district",
              "name": "叶县"
            },
            {
              "id": 410423,
              "pid": 4104,
              "level": "district",
              "name": "鲁山县"
            },
            {
              "id": 410425,
              "pid": 4104,
              "level": "district",
              "name": "郏县"
            },
            {
              "id": 410471,
              "pid": 4104,
              "level": "district",
              "name": "平顶山高新技术产业开发区"
            },
            {
              "id": 410472,
              "pid": 4104,
              "level": "district",
              "name": "平顶山市城乡一体化示范区"
            },
            {
              "id": 410481,
              "pid": 4104,
              "level": "district",
              "name": "舞钢市"
            },
            {
              "id": 410482,
              "pid": 4104,
              "level": "district",
              "name": "汝州市"
            }
          ]
        },
        {
          "id": 4105,
          "pid": 41,
          "level": "city",
          "name": "安阳市",
          "children": [
            {
              "id": 410502,
              "pid": 4105,
              "level": "district",
              "name": "文峰区"
            },
            {
              "id": 410503,
              "pid": 4105,
              "level": "district",
              "name": "北关区"
            },
            {
              "id": 410505,
              "pid": 4105,
              "level": "district",
              "name": "殷都区"
            },
            {
              "id": 410506,
              "pid": 4105,
              "level": "district",
              "name": "龙安区"
            },
            {
              "id": 410522,
              "pid": 4105,
              "level": "district",
              "name": "安阳县"
            },
            {
              "id": 410523,
              "pid": 4105,
              "level": "district",
              "name": "汤阴县"
            },
            {
              "id": 410526,
              "pid": 4105,
              "level": "district",
              "name": "滑县"
            },
            {
              "id": 410527,
              "pid": 4105,
              "level": "district",
              "name": "内黄县"
            },
            {
              "id": 410571,
              "pid": 4105,
              "level": "district",
              "name": "安阳高新技术产业开发区"
            },
            {
              "id": 410581,
              "pid": 4105,
              "level": "district",
              "name": "林州市"
            }
          ]
        },
        {
          "id": 4106,
          "pid": 41,
          "level": "city",
          "name": "鹤壁市",
          "children": [
            {
              "id": 410602,
              "pid": 4106,
              "level": "district",
              "name": "鹤山区"
            },
            {
              "id": 410603,
              "pid": 4106,
              "level": "district",
              "name": "山城区"
            },
            {
              "id": 410611,
              "pid": 4106,
              "level": "district",
              "name": "淇滨区"
            },
            {
              "id": 410621,
              "pid": 4106,
              "level": "district",
              "name": "浚县"
            },
            {
              "id": 410622,
              "pid": 4106,
              "level": "district",
              "name": "淇县"
            },
            {
              "id": 410671,
              "pid": 4106,
              "level": "district",
              "name": "鹤壁经济技术开发区"
            }
          ]
        },
        {
          "id": 4107,
          "pid": 41,
          "level": "city",
          "name": "新乡市",
          "children": [
            {
              "id": 410702,
              "pid": 4107,
              "level": "district",
              "name": "红旗区"
            },
            {
              "id": 410703,
              "pid": 4107,
              "level": "district",
              "name": "卫滨区"
            },
            {
              "id": 410704,
              "pid": 4107,
              "level": "district",
              "name": "凤泉区"
            },
            {
              "id": 410711,
              "pid": 4107,
              "level": "district",
              "name": "牧野区"
            },
            {
              "id": 410721,
              "pid": 4107,
              "level": "district",
              "name": "新乡县"
            },
            {
              "id": 410724,
              "pid": 4107,
              "level": "district",
              "name": "获嘉县"
            },
            {
              "id": 410725,
              "pid": 4107,
              "level": "district",
              "name": "原阳县"
            },
            {
              "id": 410726,
              "pid": 4107,
              "level": "district",
              "name": "延津县"
            },
            {
              "id": 410727,
              "pid": 4107,
              "level": "district",
              "name": "封丘县"
            },
            {
              "id": 410771,
              "pid": 4107,
              "level": "district",
              "name": "新乡高新技术产业开发区"
            },
            {
              "id": 410772,
              "pid": 4107,
              "level": "district",
              "name": "新乡经济技术开发区"
            },
            {
              "id": 410773,
              "pid": 4107,
              "level": "district",
              "name": "新乡市平原城乡一体化示范区"
            },
            {
              "id": 410781,
              "pid": 4107,
              "level": "district",
              "name": "卫辉市"
            },
            {
              "id": 410782,
              "pid": 4107,
              "level": "district",
              "name": "辉县市"
            },
            {
              "id": 410783,
              "pid": 4107,
              "level": "district",
              "name": "长垣市"
            }
          ]
        },
        {
          "id": 4108,
          "pid": 41,
          "level": "city",
          "name": "焦作市",
          "children": [
            {
              "id": 410802,
              "pid": 4108,
              "level": "district",
              "name": "解放区"
            },
            {
              "id": 410803,
              "pid": 4108,
              "level": "district",
              "name": "中站区"
            },
            {
              "id": 410804,
              "pid": 4108,
              "level": "district",
              "name": "马村区"
            },
            {
              "id": 410811,
              "pid": 4108,
              "level": "district",
              "name": "山阳区"
            },
            {
              "id": 410821,
              "pid": 4108,
              "level": "district",
              "name": "修武县"
            },
            {
              "id": 410822,
              "pid": 4108,
              "level": "district",
              "name": "博爱县"
            },
            {
              "id": 410823,
              "pid": 4108,
              "level": "district",
              "name": "武陟县"
            },
            {
              "id": 410825,
              "pid": 4108,
              "level": "district",
              "name": "温县"
            },
            {
              "id": 410871,
              "pid": 4108,
              "level": "district",
              "name": "焦作城乡一体化示范区"
            },
            {
              "id": 410882,
              "pid": 4108,
              "level": "district",
              "name": "沁阳市"
            },
            {
              "id": 410883,
              "pid": 4108,
              "level": "district",
              "name": "孟州市"
            }
          ]
        },
        {
          "id": 4109,
          "pid": 41,
          "level": "city",
          "name": "濮阳市",
          "children": [
            {
              "id": 410902,
              "pid": 4109,
              "level": "district",
              "name": "华龙区"
            },
            {
              "id": 410922,
              "pid": 4109,
              "level": "district",
              "name": "清丰县"
            },
            {
              "id": 410923,
              "pid": 4109,
              "level": "district",
              "name": "南乐县"
            },
            {
              "id": 410926,
              "pid": 4109,
              "level": "district",
              "name": "范县"
            },
            {
              "id": 410927,
              "pid": 4109,
              "level": "district",
              "name": "台前县"
            },
            {
              "id": 410928,
              "pid": 4109,
              "level": "district",
              "name": "濮阳县"
            },
            {
              "id": 410971,
              "pid": 4109,
              "level": "district",
              "name": "河南濮阳工业园区"
            },
            {
              "id": 410972,
              "pid": 4109,
              "level": "district",
              "name": "濮阳经济技术开发区"
            }
          ]
        },
        {
          "id": 4110,
          "pid": 41,
          "level": "city",
          "name": "许昌市",
          "children": [
            {
              "id": 411002,
              "pid": 4110,
              "level": "district",
              "name": "魏都区"
            },
            {
              "id": 411003,
              "pid": 4110,
              "level": "district",
              "name": "建安区"
            },
            {
              "id": 411024,
              "pid": 4110,
              "level": "district",
              "name": "鄢陵县"
            },
            {
              "id": 411025,
              "pid": 4110,
              "level": "district",
              "name": "襄城县"
            },
            {
              "id": 411071,
              "pid": 4110,
              "level": "district",
              "name": "许昌经济技术开发区"
            },
            {
              "id": 411081,
              "pid": 4110,
              "level": "district",
              "name": "禹州市"
            },
            {
              "id": 411082,
              "pid": 4110,
              "level": "district",
              "name": "长葛市"
            }
          ]
        },
        {
          "id": 4111,
          "pid": 41,
          "level": "city",
          "name": "漯河市",
          "children": [
            {
              "id": 411102,
              "pid": 4111,
              "level": "district",
              "name": "源汇区"
            },
            {
              "id": 411103,
              "pid": 4111,
              "level": "district",
              "name": "郾城区"
            },
            {
              "id": 411104,
              "pid": 4111,
              "level": "district",
              "name": "召陵区"
            },
            {
              "id": 411121,
              "pid": 4111,
              "level": "district",
              "name": "舞阳县"
            },
            {
              "id": 411122,
              "pid": 4111,
              "level": "district",
              "name": "临颍县"
            },
            {
              "id": 411171,
              "pid": 4111,
              "level": "district",
              "name": "漯河经济技术开发区"
            }
          ]
        },
        {
          "id": 4112,
          "pid": 41,
          "level": "city",
          "name": "三门峡市",
          "children": [
            {
              "id": 411202,
              "pid": 4112,
              "level": "district",
              "name": "湖滨区"
            },
            {
              "id": 411203,
              "pid": 4112,
              "level": "district",
              "name": "陕州区"
            },
            {
              "id": 411221,
              "pid": 4112,
              "level": "district",
              "name": "渑池县"
            },
            {
              "id": 411224,
              "pid": 4112,
              "level": "district",
              "name": "卢氏县"
            },
            {
              "id": 411271,
              "pid": 4112,
              "level": "district",
              "name": "河南三门峡经济开发区"
            },
            {
              "id": 411281,
              "pid": 4112,
              "level": "district",
              "name": "义马市"
            },
            {
              "id": 411282,
              "pid": 4112,
              "level": "district",
              "name": "灵宝市"
            }
          ]
        },
        {
          "id": 4113,
          "pid": 41,
          "level": "city",
          "name": "南阳市",
          "children": [
            {
              "id": 411302,
              "pid": 4113,
              "level": "district",
              "name": "宛城区"
            },
            {
              "id": 411303,
              "pid": 4113,
              "level": "district",
              "name": "卧龙区"
            },
            {
              "id": 411321,
              "pid": 4113,
              "level": "district",
              "name": "南召县"
            },
            {
              "id": 411322,
              "pid": 4113,
              "level": "district",
              "name": "方城县"
            },
            {
              "id": 411323,
              "pid": 4113,
              "level": "district",
              "name": "西峡县"
            },
            {
              "id": 411324,
              "pid": 4113,
              "level": "district",
              "name": "镇平县"
            },
            {
              "id": 411325,
              "pid": 4113,
              "level": "district",
              "name": "内乡县"
            },
            {
              "id": 411326,
              "pid": 4113,
              "level": "district",
              "name": "淅川县"
            },
            {
              "id": 411327,
              "pid": 4113,
              "level": "district",
              "name": "社旗县"
            },
            {
              "id": 411328,
              "pid": 4113,
              "level": "district",
              "name": "唐河县"
            },
            {
              "id": 411329,
              "pid": 4113,
              "level": "district",
              "name": "新野县"
            },
            {
              "id": 411330,
              "pid": 4113,
              "level": "district",
              "name": "桐柏县"
            },
            {
              "id": 411371,
              "pid": 4113,
              "level": "district",
              "name": "南阳高新技术产业开发区"
            },
            {
              "id": 411372,
              "pid": 4113,
              "level": "district",
              "name": "南阳市城乡一体化示范区"
            },
            {
              "id": 411381,
              "pid": 4113,
              "level": "district",
              "name": "邓州市"
            }
          ]
        },
        {
          "id": 4114,
          "pid": 41,
          "level": "city",
          "name": "商丘市",
          "children": [
            {
              "id": 411402,
              "pid": 4114,
              "level": "district",
              "name": "梁园区"
            },
            {
              "id": 411403,
              "pid": 4114,
              "level": "district",
              "name": "睢阳区"
            },
            {
              "id": 411421,
              "pid": 4114,
              "level": "district",
              "name": "民权县"
            },
            {
              "id": 411422,
              "pid": 4114,
              "level": "district",
              "name": "睢县"
            },
            {
              "id": 411423,
              "pid": 4114,
              "level": "district",
              "name": "宁陵县"
            },
            {
              "id": 411424,
              "pid": 4114,
              "level": "district",
              "name": "柘城县"
            },
            {
              "id": 411425,
              "pid": 4114,
              "level": "district",
              "name": "虞城县"
            },
            {
              "id": 411426,
              "pid": 4114,
              "level": "district",
              "name": "夏邑县"
            },
            {
              "id": 411471,
              "pid": 4114,
              "level": "district",
              "name": "豫东综合物流产业聚集区"
            },
            {
              "id": 411472,
              "pid": 4114,
              "level": "district",
              "name": "河南商丘经济开发区"
            },
            {
              "id": 411481,
              "pid": 4114,
              "level": "district",
              "name": "永城市"
            }
          ]
        },
        {
          "id": 4115,
          "pid": 41,
          "level": "city",
          "name": "信阳市",
          "children": [
            {
              "id": 411502,
              "pid": 4115,
              "level": "district",
              "name": "浉河区"
            },
            {
              "id": 411503,
              "pid": 4115,
              "level": "district",
              "name": "平桥区"
            },
            {
              "id": 411521,
              "pid": 4115,
              "level": "district",
              "name": "罗山县"
            },
            {
              "id": 411522,
              "pid": 4115,
              "level": "district",
              "name": "光山县"
            },
            {
              "id": 411523,
              "pid": 4115,
              "level": "district",
              "name": "新县"
            },
            {
              "id": 411524,
              "pid": 4115,
              "level": "district",
              "name": "商城县"
            },
            {
              "id": 411525,
              "pid": 4115,
              "level": "district",
              "name": "固始县"
            },
            {
              "id": 411526,
              "pid": 4115,
              "level": "district",
              "name": "潢川县"
            },
            {
              "id": 411527,
              "pid": 4115,
              "level": "district",
              "name": "淮滨县"
            },
            {
              "id": 411528,
              "pid": 4115,
              "level": "district",
              "name": "息县"
            },
            {
              "id": 411571,
              "pid": 4115,
              "level": "district",
              "name": "信阳高新技术产业开发区"
            }
          ]
        },
        {
          "id": 4116,
          "pid": 41,
          "level": "city",
          "name": "周口市",
          "children": [
            {
              "id": 411602,
              "pid": 4116,
              "level": "district",
              "name": "川汇区"
            },
            {
              "id": 411603,
              "pid": 4116,
              "level": "district",
              "name": "淮阳区"
            },
            {
              "id": 411621,
              "pid": 4116,
              "level": "district",
              "name": "扶沟县"
            },
            {
              "id": 411622,
              "pid": 4116,
              "level": "district",
              "name": "西华县"
            },
            {
              "id": 411623,
              "pid": 4116,
              "level": "district",
              "name": "商水县"
            },
            {
              "id": 411624,
              "pid": 4116,
              "level": "district",
              "name": "沈丘县"
            },
            {
              "id": 411625,
              "pid": 4116,
              "level": "district",
              "name": "郸城县"
            },
            {
              "id": 411627,
              "pid": 4116,
              "level": "district",
              "name": "太康县"
            },
            {
              "id": 411628,
              "pid": 4116,
              "level": "district",
              "name": "鹿邑县"
            },
            {
              "id": 411671,
              "pid": 4116,
              "level": "district",
              "name": "河南周口经济开发区"
            },
            {
              "id": 411681,
              "pid": 4116,
              "level": "district",
              "name": "项城市"
            }
          ]
        },
        {
          "id": 4117,
          "pid": 41,
          "level": "city",
          "name": "驻马店市",
          "children": [
            {
              "id": 411702,
              "pid": 4117,
              "level": "district",
              "name": "驿城区"
            },
            {
              "id": 411721,
              "pid": 4117,
              "level": "district",
              "name": "西平县"
            },
            {
              "id": 411722,
              "pid": 4117,
              "level": "district",
              "name": "上蔡县"
            },
            {
              "id": 411723,
              "pid": 4117,
              "level": "district",
              "name": "平舆县"
            },
            {
              "id": 411724,
              "pid": 4117,
              "level": "district",
              "name": "正阳县"
            },
            {
              "id": 411725,
              "pid": 4117,
              "level": "district",
              "name": "确山县"
            },
            {
              "id": 411726,
              "pid": 4117,
              "level": "district",
              "name": "泌阳县"
            },
            {
              "id": 411727,
              "pid": 4117,
              "level": "district",
              "name": "汝南县"
            },
            {
              "id": 411728,
              "pid": 4117,
              "level": "district",
              "name": "遂平县"
            },
            {
              "id": 411729,
              "pid": 4117,
              "level": "district",
              "name": "新蔡县"
            },
            {
              "id": 411771,
              "pid": 4117,
              "level": "district",
              "name": "河南驻马店经济开发区"
            }
          ]
        },
        {
          "id": 4190,
          "pid": 41,
          "level": "city",
          "name": "省直辖县级行政区划",
          "children": [
            {
              "id": 419001,
              "pid": 4190,
              "level": "district",
              "name": "济源市"
            }
          ]
        }
      ]
    },
    {
      "id": 42,
      "pid": 0,
      "level": "province",
      "name": "湖北省",
      "children": [
        {
          "id": 4201,
          "pid": 42,
          "level": "city",
          "name": "武汉市",
          "children": [
            {
              "id": 420102,
              "pid": 4201,
              "level": "district",
              "name": "江岸区"
            },
            {
              "id": 420103,
              "pid": 4201,
              "level": "district",
              "name": "江汉区"
            },
            {
              "id": 420104,
              "pid": 4201,
              "level": "district",
              "name": "硚口区"
            },
            {
              "id": 420105,
              "pid": 4201,
              "level": "district",
              "name": "汉阳区"
            },
            {
              "id": 420106,
              "pid": 4201,
              "level": "district",
              "name": "武昌区"
            },
            {
              "id": 420107,
              "pid": 4201,
              "level": "district",
              "name": "青山区"
            },
            {
              "id": 420111,
              "pid": 4201,
              "level": "district",
              "name": "洪山区"
            },
            {
              "id": 420112,
              "pid": 4201,
              "level": "district",
              "name": "东西湖区"
            },
            {
              "id": 420113,
              "pid": 4201,
              "level": "district",
              "name": "汉南区"
            },
            {
              "id": 420114,
              "pid": 4201,
              "level": "district",
              "name": "蔡甸区"
            },
            {
              "id": 420115,
              "pid": 4201,
              "level": "district",
              "name": "江夏区"
            },
            {
              "id": 420116,
              "pid": 4201,
              "level": "district",
              "name": "黄陂区"
            },
            {
              "id": 420117,
              "pid": 4201,
              "level": "district",
              "name": "新洲区"
            }
          ]
        },
        {
          "id": 4202,
          "pid": 42,
          "level": "city",
          "name": "黄石市",
          "children": [
            {
              "id": 420202,
              "pid": 4202,
              "level": "district",
              "name": "黄石港区"
            },
            {
              "id": 420203,
              "pid": 4202,
              "level": "district",
              "name": "西塞山区"
            },
            {
              "id": 420204,
              "pid": 4202,
              "level": "district",
              "name": "下陆区"
            },
            {
              "id": 420205,
              "pid": 4202,
              "level": "district",
              "name": "铁山区"
            },
            {
              "id": 420222,
              "pid": 4202,
              "level": "district",
              "name": "阳新县"
            },
            {
              "id": 420281,
              "pid": 4202,
              "level": "district",
              "name": "大冶市"
            }
          ]
        },
        {
          "id": 4203,
          "pid": 42,
          "level": "city",
          "name": "十堰市",
          "children": [
            {
              "id": 420302,
              "pid": 4203,
              "level": "district",
              "name": "茅箭区"
            },
            {
              "id": 420303,
              "pid": 4203,
              "level": "district",
              "name": "张湾区"
            },
            {
              "id": 420304,
              "pid": 4203,
              "level": "district",
              "name": "郧阳区"
            },
            {
              "id": 420322,
              "pid": 4203,
              "level": "district",
              "name": "郧西县"
            },
            {
              "id": 420323,
              "pid": 4203,
              "level": "district",
              "name": "竹山县"
            },
            {
              "id": 420324,
              "pid": 4203,
              "level": "district",
              "name": "竹溪县"
            },
            {
              "id": 420325,
              "pid": 4203,
              "level": "district",
              "name": "房县"
            },
            {
              "id": 420381,
              "pid": 4203,
              "level": "district",
              "name": "丹江口市"
            }
          ]
        },
        {
          "id": 4205,
          "pid": 42,
          "level": "city",
          "name": "宜昌市",
          "children": [
            {
              "id": 420502,
              "pid": 4205,
              "level": "district",
              "name": "西陵区"
            },
            {
              "id": 420503,
              "pid": 4205,
              "level": "district",
              "name": "伍家岗区"
            },
            {
              "id": 420504,
              "pid": 4205,
              "level": "district",
              "name": "点军区"
            },
            {
              "id": 420505,
              "pid": 4205,
              "level": "district",
              "name": "猇亭区"
            },
            {
              "id": 420506,
              "pid": 4205,
              "level": "district",
              "name": "夷陵区"
            },
            {
              "id": 420525,
              "pid": 4205,
              "level": "district",
              "name": "远安县"
            },
            {
              "id": 420526,
              "pid": 4205,
              "level": "district",
              "name": "兴山县"
            },
            {
              "id": 420527,
              "pid": 4205,
              "level": "district",
              "name": "秭归县"
            },
            {
              "id": 420528,
              "pid": 4205,
              "level": "district",
              "name": "长阳土家族自治县"
            },
            {
              "id": 420529,
              "pid": 4205,
              "level": "district",
              "name": "五峰土家族自治县"
            },
            {
              "id": 420581,
              "pid": 4205,
              "level": "district",
              "name": "宜都市"
            },
            {
              "id": 420582,
              "pid": 4205,
              "level": "district",
              "name": "当阳市"
            },
            {
              "id": 420583,
              "pid": 4205,
              "level": "district",
              "name": "枝江市"
            }
          ]
        },
        {
          "id": 4206,
          "pid": 42,
          "level": "city",
          "name": "襄阳市",
          "children": [
            {
              "id": 420602,
              "pid": 4206,
              "level": "district",
              "name": "襄城区"
            },
            {
              "id": 420606,
              "pid": 4206,
              "level": "district",
              "name": "樊城区"
            },
            {
              "id": 420607,
              "pid": 4206,
              "level": "district",
              "name": "襄州区"
            },
            {
              "id": 420624,
              "pid": 4206,
              "level": "district",
              "name": "南漳县"
            },
            {
              "id": 420625,
              "pid": 4206,
              "level": "district",
              "name": "谷城县"
            },
            {
              "id": 420626,
              "pid": 4206,
              "level": "district",
              "name": "保康县"
            },
            {
              "id": 420682,
              "pid": 4206,
              "level": "district",
              "name": "老河口市"
            },
            {
              "id": 420683,
              "pid": 4206,
              "level": "district",
              "name": "枣阳市"
            },
            {
              "id": 420684,
              "pid": 4206,
              "level": "district",
              "name": "宜城市"
            }
          ]
        },
        {
          "id": 4207,
          "pid": 42,
          "level": "city",
          "name": "鄂州市",
          "children": [
            {
              "id": 420702,
              "pid": 4207,
              "level": "district",
              "name": "梁子湖区"
            },
            {
              "id": 420703,
              "pid": 4207,
              "level": "district",
              "name": "华容区"
            },
            {
              "id": 420704,
              "pid": 4207,
              "level": "district",
              "name": "鄂城区"
            }
          ]
        },
        {
          "id": 4208,
          "pid": 42,
          "level": "city",
          "name": "荆门市",
          "children": [
            {
              "id": 420802,
              "pid": 4208,
              "level": "district",
              "name": "东宝区"
            },
            {
              "id": 420804,
              "pid": 4208,
              "level": "district",
              "name": "掇刀区"
            },
            {
              "id": 420822,
              "pid": 4208,
              "level": "district",
              "name": "沙洋县"
            },
            {
              "id": 420881,
              "pid": 4208,
              "level": "district",
              "name": "钟祥市"
            },
            {
              "id": 420882,
              "pid": 4208,
              "level": "district",
              "name": "京山市"
            }
          ]
        },
        {
          "id": 4209,
          "pid": 42,
          "level": "city",
          "name": "孝感市",
          "children": [
            {
              "id": 420902,
              "pid": 4209,
              "level": "district",
              "name": "孝南区"
            },
            {
              "id": 420921,
              "pid": 4209,
              "level": "district",
              "name": "孝昌县"
            },
            {
              "id": 420922,
              "pid": 4209,
              "level": "district",
              "name": "大悟县"
            },
            {
              "id": 420923,
              "pid": 4209,
              "level": "district",
              "name": "云梦县"
            },
            {
              "id": 420981,
              "pid": 4209,
              "level": "district",
              "name": "应城市"
            },
            {
              "id": 420982,
              "pid": 4209,
              "level": "district",
              "name": "安陆市"
            },
            {
              "id": 420984,
              "pid": 4209,
              "level": "district",
              "name": "汉川市"
            }
          ]
        },
        {
          "id": 4210,
          "pid": 42,
          "level": "city",
          "name": "荆州市",
          "children": [
            {
              "id": 421002,
              "pid": 4210,
              "level": "district",
              "name": "沙市区"
            },
            {
              "id": 421003,
              "pid": 4210,
              "level": "district",
              "name": "荆州区"
            },
            {
              "id": 421022,
              "pid": 4210,
              "level": "district",
              "name": "公安县"
            },
            {
              "id": 421024,
              "pid": 4210,
              "level": "district",
              "name": "江陵县"
            },
            {
              "id": 421071,
              "pid": 4210,
              "level": "district",
              "name": "荆州经济技术开发区"
            },
            {
              "id": 421081,
              "pid": 4210,
              "level": "district",
              "name": "石首市"
            },
            {
              "id": 421083,
              "pid": 4210,
              "level": "district",
              "name": "洪湖市"
            },
            {
              "id": 421087,
              "pid": 4210,
              "level": "district",
              "name": "松滋市"
            },
            {
              "id": 421088,
              "pid": 4210,
              "level": "district",
              "name": "监利市"
            }
          ]
        },
        {
          "id": 4211,
          "pid": 42,
          "level": "city",
          "name": "黄冈市",
          "children": [
            {
              "id": 421102,
              "pid": 4211,
              "level": "district",
              "name": "黄州区"
            },
            {
              "id": 421121,
              "pid": 4211,
              "level": "district",
              "name": "团风县"
            },
            {
              "id": 421122,
              "pid": 4211,
              "level": "district",
              "name": "红安县"
            },
            {
              "id": 421123,
              "pid": 4211,
              "level": "district",
              "name": "罗田县"
            },
            {
              "id": 421124,
              "pid": 4211,
              "level": "district",
              "name": "英山县"
            },
            {
              "id": 421125,
              "pid": 4211,
              "level": "district",
              "name": "浠水县"
            },
            {
              "id": 421126,
              "pid": 4211,
              "level": "district",
              "name": "蕲春县"
            },
            {
              "id": 421127,
              "pid": 4211,
              "level": "district",
              "name": "黄梅县"
            },
            {
              "id": 421171,
              "pid": 4211,
              "level": "district",
              "name": "龙感湖管理区"
            },
            {
              "id": 421181,
              "pid": 4211,
              "level": "district",
              "name": "麻城市"
            },
            {
              "id": 421182,
              "pid": 4211,
              "level": "district",
              "name": "武穴市"
            }
          ]
        },
        {
          "id": 4212,
          "pid": 42,
          "level": "city",
          "name": "咸宁市",
          "children": [
            {
              "id": 421202,
              "pid": 4212,
              "level": "district",
              "name": "咸安区"
            },
            {
              "id": 421221,
              "pid": 4212,
              "level": "district",
              "name": "嘉鱼县"
            },
            {
              "id": 421222,
              "pid": 4212,
              "level": "district",
              "name": "通城县"
            },
            {
              "id": 421223,
              "pid": 4212,
              "level": "district",
              "name": "崇阳县"
            },
            {
              "id": 421224,
              "pid": 4212,
              "level": "district",
              "name": "通山县"
            },
            {
              "id": 421281,
              "pid": 4212,
              "level": "district",
              "name": "赤壁市"
            }
          ]
        },
        {
          "id": 4213,
          "pid": 42,
          "level": "city",
          "name": "随州市",
          "children": [
            {
              "id": 421303,
              "pid": 4213,
              "level": "district",
              "name": "曾都区"
            },
            {
              "id": 421321,
              "pid": 4213,
              "level": "district",
              "name": "随县"
            },
            {
              "id": 421381,
              "pid": 4213,
              "level": "district",
              "name": "广水市"
            }
          ]
        },
        {
          "id": 4228,
          "pid": 42,
          "level": "city",
          "name": "恩施土家族苗族自治州",
          "children": [
            {
              "id": 422801,
              "pid": 4228,
              "level": "district",
              "name": "恩施市"
            },
            {
              "id": 422802,
              "pid": 4228,
              "level": "district",
              "name": "利川市"
            },
            {
              "id": 422822,
              "pid": 4228,
              "level": "district",
              "name": "建始县"
            },
            {
              "id": 422823,
              "pid": 4228,
              "level": "district",
              "name": "巴东县"
            },
            {
              "id": 422825,
              "pid": 4228,
              "level": "district",
              "name": "宣恩县"
            },
            {
              "id": 422826,
              "pid": 4228,
              "level": "district",
              "name": "咸丰县"
            },
            {
              "id": 422827,
              "pid": 4228,
              "level": "district",
              "name": "来凤县"
            },
            {
              "id": 422828,
              "pid": 4228,
              "level": "district",
              "name": "鹤峰县"
            }
          ]
        },
        {
          "id": 4290,
          "pid": 42,
          "level": "city",
          "name": "省直辖县级行政区划",
          "children": [
            {
              "id": 429004,
              "pid": 4290,
              "level": "district",
              "name": "仙桃市"
            },
            {
              "id": 429005,
              "pid": 4290,
              "level": "district",
              "name": "潜江市"
            },
            {
              "id": 429006,
              "pid": 4290,
              "level": "district",
              "name": "天门市"
            },
            {
              "id": 429021,
              "pid": 4290,
              "level": "district",
              "name": "神农架林区"
            }
          ]
        }
      ]
    },
    {
      "id": 43,
      "pid": 0,
      "level": "province",
      "name": "湖南省",
      "children": [
        {
          "id": 4301,
          "pid": 43,
          "level": "city",
          "name": "长沙市",
          "children": [
            {
              "id": 430102,
              "pid": 4301,
              "level": "district",
              "name": "芙蓉区"
            },
            {
              "id": 430103,
              "pid": 4301,
              "level": "district",
              "name": "天心区"
            },
            {
              "id": 430104,
              "pid": 4301,
              "level": "district",
              "name": "岳麓区"
            },
            {
              "id": 430105,
              "pid": 4301,
              "level": "district",
              "name": "开福区"
            },
            {
              "id": 430111,
              "pid": 4301,
              "level": "district",
              "name": "雨花区"
            },
            {
              "id": 430112,
              "pid": 4301,
              "level": "district",
              "name": "望城区"
            },
            {
              "id": 430121,
              "pid": 4301,
              "level": "district",
              "name": "长沙县"
            },
            {
              "id": 430181,
              "pid": 4301,
              "level": "district",
              "name": "浏阳市"
            },
            {
              "id": 430182,
              "pid": 4301,
              "level": "district",
              "name": "宁乡市"
            }
          ]
        },
        {
          "id": 4302,
          "pid": 43,
          "level": "city",
          "name": "株洲市",
          "children": [
            {
              "id": 430202,
              "pid": 4302,
              "level": "district",
              "name": "荷塘区"
            },
            {
              "id": 430203,
              "pid": 4302,
              "level": "district",
              "name": "芦淞区"
            },
            {
              "id": 430204,
              "pid": 4302,
              "level": "district",
              "name": "石峰区"
            },
            {
              "id": 430211,
              "pid": 4302,
              "level": "district",
              "name": "天元区"
            },
            {
              "id": 430212,
              "pid": 4302,
              "level": "district",
              "name": "渌口区"
            },
            {
              "id": 430223,
              "pid": 4302,
              "level": "district",
              "name": "攸县"
            },
            {
              "id": 430224,
              "pid": 4302,
              "level": "district",
              "name": "茶陵县"
            },
            {
              "id": 430225,
              "pid": 4302,
              "level": "district",
              "name": "炎陵县"
            },
            {
              "id": 430271,
              "pid": 4302,
              "level": "district",
              "name": "云龙示范区"
            },
            {
              "id": 430281,
              "pid": 4302,
              "level": "district",
              "name": "醴陵市"
            }
          ]
        },
        {
          "id": 4303,
          "pid": 43,
          "level": "city",
          "name": "湘潭市",
          "children": [
            {
              "id": 430302,
              "pid": 4303,
              "level": "district",
              "name": "雨湖区"
            },
            {
              "id": 430304,
              "pid": 4303,
              "level": "district",
              "name": "岳塘区"
            },
            {
              "id": 430321,
              "pid": 4303,
              "level": "district",
              "name": "湘潭县"
            },
            {
              "id": 430371,
              "pid": 4303,
              "level": "district",
              "name": "湖南湘潭高新技术产业园区"
            },
            {
              "id": 430372,
              "pid": 4303,
              "level": "district",
              "name": "湘潭昭山示范区"
            },
            {
              "id": 430373,
              "pid": 4303,
              "level": "district",
              "name": "湘潭九华示范区"
            },
            {
              "id": 430381,
              "pid": 4303,
              "level": "district",
              "name": "湘乡市"
            },
            {
              "id": 430382,
              "pid": 4303,
              "level": "district",
              "name": "韶山市"
            }
          ]
        },
        {
          "id": 4304,
          "pid": 43,
          "level": "city",
          "name": "衡阳市",
          "children": [
            {
              "id": 430405,
              "pid": 4304,
              "level": "district",
              "name": "珠晖区"
            },
            {
              "id": 430406,
              "pid": 4304,
              "level": "district",
              "name": "雁峰区"
            },
            {
              "id": 430407,
              "pid": 4304,
              "level": "district",
              "name": "石鼓区"
            },
            {
              "id": 430408,
              "pid": 4304,
              "level": "district",
              "name": "蒸湘区"
            },
            {
              "id": 430412,
              "pid": 4304,
              "level": "district",
              "name": "南岳区"
            },
            {
              "id": 430421,
              "pid": 4304,
              "level": "district",
              "name": "衡阳县"
            },
            {
              "id": 430422,
              "pid": 4304,
              "level": "district",
              "name": "衡南县"
            },
            {
              "id": 430423,
              "pid": 4304,
              "level": "district",
              "name": "衡山县"
            },
            {
              "id": 430424,
              "pid": 4304,
              "level": "district",
              "name": "衡东县"
            },
            {
              "id": 430426,
              "pid": 4304,
              "level": "district",
              "name": "祁东县"
            },
            {
              "id": 430471,
              "pid": 4304,
              "level": "district",
              "name": "衡阳综合保税区"
            },
            {
              "id": 430472,
              "pid": 4304,
              "level": "district",
              "name": "湖南衡阳高新技术产业园区"
            },
            {
              "id": 430473,
              "pid": 4304,
              "level": "district",
              "name": "湖南衡阳松木经济开发区"
            },
            {
              "id": 430481,
              "pid": 4304,
              "level": "district",
              "name": "耒阳市"
            },
            {
              "id": 430482,
              "pid": 4304,
              "level": "district",
              "name": "常宁市"
            }
          ]
        },
        {
          "id": 4305,
          "pid": 43,
          "level": "city",
          "name": "邵阳市",
          "children": [
            {
              "id": 430502,
              "pid": 4305,
              "level": "district",
              "name": "双清区"
            },
            {
              "id": 430503,
              "pid": 4305,
              "level": "district",
              "name": "大祥区"
            },
            {
              "id": 430511,
              "pid": 4305,
              "level": "district",
              "name": "北塔区"
            },
            {
              "id": 430522,
              "pid": 4305,
              "level": "district",
              "name": "新邵县"
            },
            {
              "id": 430523,
              "pid": 4305,
              "level": "district",
              "name": "邵阳县"
            },
            {
              "id": 430524,
              "pid": 4305,
              "level": "district",
              "name": "隆回县"
            },
            {
              "id": 430525,
              "pid": 4305,
              "level": "district",
              "name": "洞口县"
            },
            {
              "id": 430527,
              "pid": 4305,
              "level": "district",
              "name": "绥宁县"
            },
            {
              "id": 430528,
              "pid": 4305,
              "level": "district",
              "name": "新宁县"
            },
            {
              "id": 430529,
              "pid": 4305,
              "level": "district",
              "name": "城步苗族自治县"
            },
            {
              "id": 430581,
              "pid": 4305,
              "level": "district",
              "name": "武冈市"
            },
            {
              "id": 430582,
              "pid": 4305,
              "level": "district",
              "name": "邵东市"
            }
          ]
        },
        {
          "id": 4306,
          "pid": 43,
          "level": "city",
          "name": "岳阳市",
          "children": [
            {
              "id": 430602,
              "pid": 4306,
              "level": "district",
              "name": "岳阳楼区"
            },
            {
              "id": 430603,
              "pid": 4306,
              "level": "district",
              "name": "云溪区"
            },
            {
              "id": 430611,
              "pid": 4306,
              "level": "district",
              "name": "君山区"
            },
            {
              "id": 430621,
              "pid": 4306,
              "level": "district",
              "name": "岳阳县"
            },
            {
              "id": 430623,
              "pid": 4306,
              "level": "district",
              "name": "华容县"
            },
            {
              "id": 430624,
              "pid": 4306,
              "level": "district",
              "name": "湘阴县"
            },
            {
              "id": 430626,
              "pid": 4306,
              "level": "district",
              "name": "平江县"
            },
            {
              "id": 430671,
              "pid": 4306,
              "level": "district",
              "name": "岳阳市屈原管理区"
            },
            {
              "id": 430681,
              "pid": 4306,
              "level": "district",
              "name": "汨罗市"
            },
            {
              "id": 430682,
              "pid": 4306,
              "level": "district",
              "name": "临湘市"
            }
          ]
        },
        {
          "id": 4307,
          "pid": 43,
          "level": "city",
          "name": "常德市",
          "children": [
            {
              "id": 430702,
              "pid": 4307,
              "level": "district",
              "name": "武陵区"
            },
            {
              "id": 430703,
              "pid": 4307,
              "level": "district",
              "name": "鼎城区"
            },
            {
              "id": 430721,
              "pid": 4307,
              "level": "district",
              "name": "安乡县"
            },
            {
              "id": 430722,
              "pid": 4307,
              "level": "district",
              "name": "汉寿县"
            },
            {
              "id": 430723,
              "pid": 4307,
              "level": "district",
              "name": "澧县"
            },
            {
              "id": 430724,
              "pid": 4307,
              "level": "district",
              "name": "临澧县"
            },
            {
              "id": 430725,
              "pid": 4307,
              "level": "district",
              "name": "桃源县"
            },
            {
              "id": 430726,
              "pid": 4307,
              "level": "district",
              "name": "石门县"
            },
            {
              "id": 430771,
              "pid": 4307,
              "level": "district",
              "name": "常德市西洞庭管理区"
            },
            {
              "id": 430781,
              "pid": 4307,
              "level": "district",
              "name": "津市市"
            }
          ]
        },
        {
          "id": 4308,
          "pid": 43,
          "level": "city",
          "name": "张家界市",
          "children": [
            {
              "id": 430802,
              "pid": 4308,
              "level": "district",
              "name": "永定区"
            },
            {
              "id": 430811,
              "pid": 4308,
              "level": "district",
              "name": "武陵源区"
            },
            {
              "id": 430821,
              "pid": 4308,
              "level": "district",
              "name": "慈利县"
            },
            {
              "id": 430822,
              "pid": 4308,
              "level": "district",
              "name": "桑植县"
            }
          ]
        },
        {
          "id": 4309,
          "pid": 43,
          "level": "city",
          "name": "益阳市",
          "children": [
            {
              "id": 430902,
              "pid": 4309,
              "level": "district",
              "name": "资阳区"
            },
            {
              "id": 430903,
              "pid": 4309,
              "level": "district",
              "name": "赫山区"
            },
            {
              "id": 430921,
              "pid": 4309,
              "level": "district",
              "name": "南县"
            },
            {
              "id": 430922,
              "pid": 4309,
              "level": "district",
              "name": "桃江县"
            },
            {
              "id": 430923,
              "pid": 4309,
              "level": "district",
              "name": "安化县"
            },
            {
              "id": 430971,
              "pid": 4309,
              "level": "district",
              "name": "益阳市大通湖管理区"
            },
            {
              "id": 430972,
              "pid": 4309,
              "level": "district",
              "name": "湖南益阳高新技术产业园区"
            },
            {
              "id": 430981,
              "pid": 4309,
              "level": "district",
              "name": "沅江市"
            }
          ]
        },
        {
          "id": 4310,
          "pid": 43,
          "level": "city",
          "name": "郴州市",
          "children": [
            {
              "id": 431002,
              "pid": 4310,
              "level": "district",
              "name": "北湖区"
            },
            {
              "id": 431003,
              "pid": 4310,
              "level": "district",
              "name": "苏仙区"
            },
            {
              "id": 431021,
              "pid": 4310,
              "level": "district",
              "name": "桂阳县"
            },
            {
              "id": 431022,
              "pid": 4310,
              "level": "district",
              "name": "宜章县"
            },
            {
              "id": 431023,
              "pid": 4310,
              "level": "district",
              "name": "永兴县"
            },
            {
              "id": 431024,
              "pid": 4310,
              "level": "district",
              "name": "嘉禾县"
            },
            {
              "id": 431025,
              "pid": 4310,
              "level": "district",
              "name": "临武县"
            },
            {
              "id": 431026,
              "pid": 4310,
              "level": "district",
              "name": "汝城县"
            },
            {
              "id": 431027,
              "pid": 4310,
              "level": "district",
              "name": "桂东县"
            },
            {
              "id": 431028,
              "pid": 4310,
              "level": "district",
              "name": "安仁县"
            },
            {
              "id": 431081,
              "pid": 4310,
              "level": "district",
              "name": "资兴市"
            }
          ]
        },
        {
          "id": 4311,
          "pid": 43,
          "level": "city",
          "name": "永州市",
          "children": [
            {
              "id": 431102,
              "pid": 4311,
              "level": "district",
              "name": "零陵区"
            },
            {
              "id": 431103,
              "pid": 4311,
              "level": "district",
              "name": "冷水滩区"
            },
            {
              "id": 431122,
              "pid": 4311,
              "level": "district",
              "name": "东安县"
            },
            {
              "id": 431123,
              "pid": 4311,
              "level": "district",
              "name": "双牌县"
            },
            {
              "id": 431124,
              "pid": 4311,
              "level": "district",
              "name": "道县"
            },
            {
              "id": 431125,
              "pid": 4311,
              "level": "district",
              "name": "江永县"
            },
            {
              "id": 431126,
              "pid": 4311,
              "level": "district",
              "name": "宁远县"
            },
            {
              "id": 431127,
              "pid": 4311,
              "level": "district",
              "name": "蓝山县"
            },
            {
              "id": 431128,
              "pid": 4311,
              "level": "district",
              "name": "新田县"
            },
            {
              "id": 431129,
              "pid": 4311,
              "level": "district",
              "name": "江华瑶族自治县"
            },
            {
              "id": 431171,
              "pid": 4311,
              "level": "district",
              "name": "永州经济技术开发区"
            },
            {
              "id": 431173,
              "pid": 4311,
              "level": "district",
              "name": "永州市回龙圩管理区"
            },
            {
              "id": 431181,
              "pid": 4311,
              "level": "district",
              "name": "祁阳市"
            }
          ]
        },
        {
          "id": 4312,
          "pid": 43,
          "level": "city",
          "name": "怀化市",
          "children": [
            {
              "id": 431202,
              "pid": 4312,
              "level": "district",
              "name": "鹤城区"
            },
            {
              "id": 431221,
              "pid": 4312,
              "level": "district",
              "name": "中方县"
            },
            {
              "id": 431222,
              "pid": 4312,
              "level": "district",
              "name": "沅陵县"
            },
            {
              "id": 431223,
              "pid": 4312,
              "level": "district",
              "name": "辰溪县"
            },
            {
              "id": 431224,
              "pid": 4312,
              "level": "district",
              "name": "溆浦县"
            },
            {
              "id": 431225,
              "pid": 4312,
              "level": "district",
              "name": "会同县"
            },
            {
              "id": 431226,
              "pid": 4312,
              "level": "district",
              "name": "麻阳苗族自治县"
            },
            {
              "id": 431227,
              "pid": 4312,
              "level": "district",
              "name": "新晃侗族自治县"
            },
            {
              "id": 431228,
              "pid": 4312,
              "level": "district",
              "name": "芷江侗族自治县"
            },
            {
              "id": 431229,
              "pid": 4312,
              "level": "district",
              "name": "靖州苗族侗族自治县"
            },
            {
              "id": 431230,
              "pid": 4312,
              "level": "district",
              "name": "通道侗族自治县"
            },
            {
              "id": 431271,
              "pid": 4312,
              "level": "district",
              "name": "怀化市洪江管理区"
            },
            {
              "id": 431281,
              "pid": 4312,
              "level": "district",
              "name": "洪江市"
            }
          ]
        },
        {
          "id": 4313,
          "pid": 43,
          "level": "city",
          "name": "娄底市",
          "children": [
            {
              "id": 431302,
              "pid": 4313,
              "level": "district",
              "name": "娄星区"
            },
            {
              "id": 431321,
              "pid": 4313,
              "level": "district",
              "name": "双峰县"
            },
            {
              "id": 431322,
              "pid": 4313,
              "level": "district",
              "name": "新化县"
            },
            {
              "id": 431381,
              "pid": 4313,
              "level": "district",
              "name": "冷水江市"
            },
            {
              "id": 431382,
              "pid": 4313,
              "level": "district",
              "name": "涟源市"
            }
          ]
        },
        {
          "id": 4331,
          "pid": 43,
          "level": "city",
          "name": "湘西土家族苗族自治州",
          "children": [
            {
              "id": 433101,
              "pid": 4331,
              "level": "district",
              "name": "吉首市"
            },
            {
              "id": 433122,
              "pid": 4331,
              "level": "district",
              "name": "泸溪县"
            },
            {
              "id": 433123,
              "pid": 4331,
              "level": "district",
              "name": "凤凰县"
            },
            {
              "id": 433124,
              "pid": 4331,
              "level": "district",
              "name": "花垣县"
            },
            {
              "id": 433125,
              "pid": 4331,
              "level": "district",
              "name": "保靖县"
            },
            {
              "id": 433126,
              "pid": 4331,
              "level": "district",
              "name": "古丈县"
            },
            {
              "id": 433127,
              "pid": 4331,
              "level": "district",
              "name": "永顺县"
            },
            {
              "id": 433130,
              "pid": 4331,
              "level": "district",
              "name": "龙山县"
            }
          ]
        }
      ]
    },
    {
      "id": 44,
      "pid": 0,
      "level": "province",
      "name": "广东省",
      "children": [
        {
          "id": 4401,
          "pid": 44,
          "level": "city",
          "name": "广州市",
          "children": [
            {
              "id": 440103,
              "pid": 4401,
              "level": "district",
              "name": "荔湾区"
            },
            {
              "id": 440104,
              "pid": 4401,
              "level": "district",
              "name": "越秀区"
            },
            {
              "id": 440105,
              "pid": 4401,
              "level": "district",
              "name": "海珠区"
            },
            {
              "id": 440106,
              "pid": 4401,
              "level": "district",
              "name": "天河区"
            },
            {
              "id": 440111,
              "pid": 4401,
              "level": "district",
              "name": "白云区"
            },
            {
              "id": 440112,
              "pid": 4401,
              "level": "district",
              "name": "黄埔区"
            },
            {
              "id": 440113,
              "pid": 4401,
              "level": "district",
              "name": "番禺区"
            },
            {
              "id": 440114,
              "pid": 4401,
              "level": "district",
              "name": "花都区"
            },
            {
              "id": 440115,
              "pid": 4401,
              "level": "district",
              "name": "南沙区"
            },
            {
              "id": 440117,
              "pid": 4401,
              "level": "district",
              "name": "从化区"
            },
            {
              "id": 440118,
              "pid": 4401,
              "level": "district",
              "name": "增城区"
            }
          ]
        },
        {
          "id": 4402,
          "pid": 44,
          "level": "city",
          "name": "韶关市",
          "children": [
            {
              "id": 440203,
              "pid": 4402,
              "level": "district",
              "name": "武江区"
            },
            {
              "id": 440204,
              "pid": 4402,
              "level": "district",
              "name": "浈江区"
            },
            {
              "id": 440205,
              "pid": 4402,
              "level": "district",
              "name": "曲江区"
            },
            {
              "id": 440222,
              "pid": 4402,
              "level": "district",
              "name": "始兴县"
            },
            {
              "id": 440224,
              "pid": 4402,
              "level": "district",
              "name": "仁化县"
            },
            {
              "id": 440229,
              "pid": 4402,
              "level": "district",
              "name": "翁源县"
            },
            {
              "id": 440232,
              "pid": 4402,
              "level": "district",
              "name": "乳源瑶族自治县"
            },
            {
              "id": 440233,
              "pid": 4402,
              "level": "district",
              "name": "新丰县"
            },
            {
              "id": 440281,
              "pid": 4402,
              "level": "district",
              "name": "乐昌市"
            },
            {
              "id": 440282,
              "pid": 4402,
              "level": "district",
              "name": "南雄市"
            }
          ]
        },
        {
          "id": 4403,
          "pid": 44,
          "level": "city",
          "name": "深圳市",
          "children": [
            {
              "id": 440303,
              "pid": 4403,
              "level": "district",
              "name": "罗湖区"
            },
            {
              "id": 440304,
              "pid": 4403,
              "level": "district",
              "name": "福田区"
            },
            {
              "id": 440305,
              "pid": 4403,
              "level": "district",
              "name": "南山区"
            },
            {
              "id": 440306,
              "pid": 4403,
              "level": "district",
              "name": "宝安区"
            },
            {
              "id": 440307,
              "pid": 4403,
              "level": "district",
              "name": "龙岗区"
            },
            {
              "id": 440308,
              "pid": 4403,
              "level": "district",
              "name": "盐田区"
            },
            {
              "id": 440309,
              "pid": 4403,
              "level": "district",
              "name": "龙华区"
            },
            {
              "id": 440310,
              "pid": 4403,
              "level": "district",
              "name": "坪山区"
            },
            {
              "id": 440311,
              "pid": 4403,
              "level": "district",
              "name": "光明区"
            }
          ]
        },
        {
          "id": 4404,
          "pid": 44,
          "level": "city",
          "name": "珠海市",
          "children": [
            {
              "id": 440402,
              "pid": 4404,
              "level": "district",
              "name": "香洲区"
            },
            {
              "id": 440403,
              "pid": 4404,
              "level": "district",
              "name": "斗门区"
            },
            {
              "id": 440404,
              "pid": 4404,
              "level": "district",
              "name": "金湾区"
            }
          ]
        },
        {
          "id": 4405,
          "pid": 44,
          "level": "city",
          "name": "汕头市",
          "children": [
            {
              "id": 440507,
              "pid": 4405,
              "level": "district",
              "name": "龙湖区"
            },
            {
              "id": 440511,
              "pid": 4405,
              "level": "district",
              "name": "金平区"
            },
            {
              "id": 440512,
              "pid": 4405,
              "level": "district",
              "name": "濠江区"
            },
            {
              "id": 440513,
              "pid": 4405,
              "level": "district",
              "name": "潮阳区"
            },
            {
              "id": 440514,
              "pid": 4405,
              "level": "district",
              "name": "潮南区"
            },
            {
              "id": 440515,
              "pid": 4405,
              "level": "district",
              "name": "澄海区"
            },
            {
              "id": 440523,
              "pid": 4405,
              "level": "district",
              "name": "南澳县"
            }
          ]
        },
        {
          "id": 4406,
          "pid": 44,
          "level": "city",
          "name": "佛山市",
          "children": [
            {
              "id": 440604,
              "pid": 4406,
              "level": "district",
              "name": "禅城区"
            },
            {
              "id": 440605,
              "pid": 4406,
              "level": "district",
              "name": "南海区"
            },
            {
              "id": 440606,
              "pid": 4406,
              "level": "district",
              "name": "顺德区"
            },
            {
              "id": 440607,
              "pid": 4406,
              "level": "district",
              "name": "三水区"
            },
            {
              "id": 440608,
              "pid": 4406,
              "level": "district",
              "name": "高明区"
            }
          ]
        },
        {
          "id": 4407,
          "pid": 44,
          "level": "city",
          "name": "江门市",
          "children": [
            {
              "id": 440703,
              "pid": 4407,
              "level": "district",
              "name": "蓬江区"
            },
            {
              "id": 440704,
              "pid": 4407,
              "level": "district",
              "name": "江海区"
            },
            {
              "id": 440705,
              "pid": 4407,
              "level": "district",
              "name": "新会区"
            },
            {
              "id": 440781,
              "pid": 4407,
              "level": "district",
              "name": "台山市"
            },
            {
              "id": 440783,
              "pid": 4407,
              "level": "district",
              "name": "开平市"
            },
            {
              "id": 440784,
              "pid": 4407,
              "level": "district",
              "name": "鹤山市"
            },
            {
              "id": 440785,
              "pid": 4407,
              "level": "district",
              "name": "恩平市"
            }
          ]
        },
        {
          "id": 4408,
          "pid": 44,
          "level": "city",
          "name": "湛江市",
          "children": [
            {
              "id": 440802,
              "pid": 4408,
              "level": "district",
              "name": "赤坎区"
            },
            {
              "id": 440803,
              "pid": 4408,
              "level": "district",
              "name": "霞山区"
            },
            {
              "id": 440804,
              "pid": 4408,
              "level": "district",
              "name": "坡头区"
            },
            {
              "id": 440811,
              "pid": 4408,
              "level": "district",
              "name": "麻章区"
            },
            {
              "id": 440823,
              "pid": 4408,
              "level": "district",
              "name": "遂溪县"
            },
            {
              "id": 440825,
              "pid": 4408,
              "level": "district",
              "name": "徐闻县"
            },
            {
              "id": 440881,
              "pid": 4408,
              "level": "district",
              "name": "廉江市"
            },
            {
              "id": 440882,
              "pid": 4408,
              "level": "district",
              "name": "雷州市"
            },
            {
              "id": 440883,
              "pid": 4408,
              "level": "district",
              "name": "吴川市"
            }
          ]
        },
        {
          "id": 4409,
          "pid": 44,
          "level": "city",
          "name": "茂名市",
          "children": [
            {
              "id": 440902,
              "pid": 4409,
              "level": "district",
              "name": "茂南区"
            },
            {
              "id": 440904,
              "pid": 4409,
              "level": "district",
              "name": "电白区"
            },
            {
              "id": 440981,
              "pid": 4409,
              "level": "district",
              "name": "高州市"
            },
            {
              "id": 440982,
              "pid": 4409,
              "level": "district",
              "name": "化州市"
            },
            {
              "id": 440983,
              "pid": 4409,
              "level": "district",
              "name": "信宜市"
            }
          ]
        },
        {
          "id": 4412,
          "pid": 44,
          "level": "city",
          "name": "肇庆市",
          "children": [
            {
              "id": 441202,
              "pid": 4412,
              "level": "district",
              "name": "端州区"
            },
            {
              "id": 441203,
              "pid": 4412,
              "level": "district",
              "name": "鼎湖区"
            },
            {
              "id": 441204,
              "pid": 4412,
              "level": "district",
              "name": "高要区"
            },
            {
              "id": 441223,
              "pid": 4412,
              "level": "district",
              "name": "广宁县"
            },
            {
              "id": 441224,
              "pid": 4412,
              "level": "district",
              "name": "怀集县"
            },
            {
              "id": 441225,
              "pid": 4412,
              "level": "district",
              "name": "封开县"
            },
            {
              "id": 441226,
              "pid": 4412,
              "level": "district",
              "name": "德庆县"
            },
            {
              "id": 441284,
              "pid": 4412,
              "level": "district",
              "name": "四会市"
            }
          ]
        },
        {
          "id": 4413,
          "pid": 44,
          "level": "city",
          "name": "惠州市",
          "children": [
            {
              "id": 441302,
              "pid": 4413,
              "level": "district",
              "name": "惠城区"
            },
            {
              "id": 441303,
              "pid": 4413,
              "level": "district",
              "name": "惠阳区"
            },
            {
              "id": 441322,
              "pid": 4413,
              "level": "district",
              "name": "博罗县"
            },
            {
              "id": 441323,
              "pid": 4413,
              "level": "district",
              "name": "惠东县"
            },
            {
              "id": 441324,
              "pid": 4413,
              "level": "district",
              "name": "龙门县"
            }
          ]
        },
        {
          "id": 4414,
          "pid": 44,
          "level": "city",
          "name": "梅州市",
          "children": [
            {
              "id": 441402,
              "pid": 4414,
              "level": "district",
              "name": "梅江区"
            },
            {
              "id": 441403,
              "pid": 4414,
              "level": "district",
              "name": "梅县区"
            },
            {
              "id": 441422,
              "pid": 4414,
              "level": "district",
              "name": "大埔县"
            },
            {
              "id": 441423,
              "pid": 4414,
              "level": "district",
              "name": "丰顺县"
            },
            {
              "id": 441424,
              "pid": 4414,
              "level": "district",
              "name": "五华县"
            },
            {
              "id": 441426,
              "pid": 4414,
              "level": "district",
              "name": "平远县"
            },
            {
              "id": 441427,
              "pid": 4414,
              "level": "district",
              "name": "蕉岭县"
            },
            {
              "id": 441481,
              "pid": 4414,
              "level": "district",
              "name": "兴宁市"
            }
          ]
        },
        {
          "id": 4415,
          "pid": 44,
          "level": "city",
          "name": "汕尾市",
          "children": [
            {
              "id": 441502,
              "pid": 4415,
              "level": "district",
              "name": "城区"
            },
            {
              "id": 441521,
              "pid": 4415,
              "level": "district",
              "name": "海丰县"
            },
            {
              "id": 441523,
              "pid": 4415,
              "level": "district",
              "name": "陆河县"
            },
            {
              "id": 441581,
              "pid": 4415,
              "level": "district",
              "name": "陆丰市"
            }
          ]
        },
        {
          "id": 4416,
          "pid": 44,
          "level": "city",
          "name": "河源市",
          "children": [
            {
              "id": 441602,
              "pid": 4416,
              "level": "district",
              "name": "源城区"
            },
            {
              "id": 441621,
              "pid": 4416,
              "level": "district",
              "name": "紫金县"
            },
            {
              "id": 441622,
              "pid": 4416,
              "level": "district",
              "name": "龙川县"
            },
            {
              "id": 441623,
              "pid": 4416,
              "level": "district",
              "name": "连平县"
            },
            {
              "id": 441624,
              "pid": 4416,
              "level": "district",
              "name": "和平县"
            },
            {
              "id": 441625,
              "pid": 4416,
              "level": "district",
              "name": "东源县"
            }
          ]
        },
        {
          "id": 4417,
          "pid": 44,
          "level": "city",
          "name": "阳江市",
          "children": [
            {
              "id": 441702,
              "pid": 4417,
              "level": "district",
              "name": "江城区"
            },
            {
              "id": 441704,
              "pid": 4417,
              "level": "district",
              "name": "阳东区"
            },
            {
              "id": 441721,
              "pid": 4417,
              "level": "district",
              "name": "阳西县"
            },
            {
              "id": 441781,
              "pid": 4417,
              "level": "district",
              "name": "阳春市"
            }
          ]
        },
        {
          "id": 4418,
          "pid": 44,
          "level": "city",
          "name": "清远市",
          "children": [
            {
              "id": 441802,
              "pid": 4418,
              "level": "district",
              "name": "清城区"
            },
            {
              "id": 441803,
              "pid": 4418,
              "level": "district",
              "name": "清新区"
            },
            {
              "id": 441821,
              "pid": 4418,
              "level": "district",
              "name": "佛冈县"
            },
            {
              "id": 441823,
              "pid": 4418,
              "level": "district",
              "name": "阳山县"
            },
            {
              "id": 441825,
              "pid": 4418,
              "level": "district",
              "name": "连山壮族瑶族自治县"
            },
            {
              "id": 441826,
              "pid": 4418,
              "level": "district",
              "name": "连南瑶族自治县"
            },
            {
              "id": 441881,
              "pid": 4418,
              "level": "district",
              "name": "英德市"
            },
            {
              "id": 441882,
              "pid": 4418,
              "level": "district",
              "name": "连州市"
            }
          ]
        },
        {
          "id": 4419,
          "pid": 44,
          "level": "city",
          "name": "东莞市",
          "children": [
            {
              "id": 441900,
              "pid": 4419,
              "level": "district",
              "name": "东莞市"
            }
          ]
        },
        {
          "id": 4420,
          "pid": 44,
          "level": "city",
          "name": "中山市",
          "children": [
            {
              "id": 442000,
              "pid": 4420,
              "level": "district",
              "name": "中山市"
            }
          ]
        },
        {
          "id": 4451,
          "pid": 44,
          "level": "city",
          "name": "潮州市",
          "children": [
            {
              "id": 445102,
              "pid": 4451,
              "level": "district",
              "name": "湘桥区"
            },
            {
              "id": 445103,
              "pid": 4451,
              "level": "district",
              "name": "潮安区"
            },
            {
              "id": 445122,
              "pid": 4451,
              "level": "district",
              "name": "饶平县"
            }
          ]
        },
        {
          "id": 4452,
          "pid": 44,
          "level": "city",
          "name": "揭阳市",
          "children": [
            {
              "id": 445202,
              "pid": 4452,
              "level": "district",
              "name": "榕城区"
            },
            {
              "id": 445203,
              "pid": 4452,
              "level": "district",
              "name": "揭东区"
            },
            {
              "id": 445222,
              "pid": 4452,
              "level": "district",
              "name": "揭西县"
            },
            {
              "id": 445224,
              "pid": 4452,
              "level": "district",
              "name": "惠来县"
            },
            {
              "id": 445281,
              "pid": 4452,
              "level": "district",
              "name": "普宁市"
            }
          ]
        },
        {
          "id": 4453,
          "pid": 44,
          "level": "city",
          "name": "云浮市",
          "children": [
            {
              "id": 445302,
              "pid": 4453,
              "level": "district",
              "name": "云城区"
            },
            {
              "id": 445303,
              "pid": 4453,
              "level": "district",
              "name": "云安区"
            },
            {
              "id": 445321,
              "pid": 4453,
              "level": "district",
              "name": "新兴县"
            },
            {
              "id": 445322,
              "pid": 4453,
              "level": "district",
              "name": "郁南县"
            },
            {
              "id": 445381,
              "pid": 4453,
              "level": "district",
              "name": "罗定市"
            }
          ]
        }
      ]
    },
    {
      "id": 45,
      "pid": 0,
      "level": "province",
      "name": "广西壮族自治区",
      "children": [
        {
          "id": 4501,
          "pid": 45,
          "level": "city",
          "name": "南宁市",
          "children": [
            {
              "id": 450102,
              "pid": 4501,
              "level": "district",
              "name": "兴宁区"
            },
            {
              "id": 450103,
              "pid": 4501,
              "level": "district",
              "name": "青秀区"
            },
            {
              "id": 450105,
              "pid": 4501,
              "level": "district",
              "name": "江南区"
            },
            {
              "id": 450107,
              "pid": 4501,
              "level": "district",
              "name": "西乡塘区"
            },
            {
              "id": 450108,
              "pid": 4501,
              "level": "district",
              "name": "良庆区"
            },
            {
              "id": 450109,
              "pid": 4501,
              "level": "district",
              "name": "邕宁区"
            },
            {
              "id": 450110,
              "pid": 4501,
              "level": "district",
              "name": "武鸣区"
            },
            {
              "id": 450123,
              "pid": 4501,
              "level": "district",
              "name": "隆安县"
            },
            {
              "id": 450124,
              "pid": 4501,
              "level": "district",
              "name": "马山县"
            },
            {
              "id": 450125,
              "pid": 4501,
              "level": "district",
              "name": "上林县"
            },
            {
              "id": 450126,
              "pid": 4501,
              "level": "district",
              "name": "宾阳县"
            },
            {
              "id": 450181,
              "pid": 4501,
              "level": "district",
              "name": "横州市"
            }
          ]
        },
        {
          "id": 4502,
          "pid": 45,
          "level": "city",
          "name": "柳州市",
          "children": [
            {
              "id": 450202,
              "pid": 4502,
              "level": "district",
              "name": "城中区"
            },
            {
              "id": 450203,
              "pid": 4502,
              "level": "district",
              "name": "鱼峰区"
            },
            {
              "id": 450204,
              "pid": 4502,
              "level": "district",
              "name": "柳南区"
            },
            {
              "id": 450205,
              "pid": 4502,
              "level": "district",
              "name": "柳北区"
            },
            {
              "id": 450206,
              "pid": 4502,
              "level": "district",
              "name": "柳江区"
            },
            {
              "id": 450222,
              "pid": 4502,
              "level": "district",
              "name": "柳城县"
            },
            {
              "id": 450223,
              "pid": 4502,
              "level": "district",
              "name": "鹿寨县"
            },
            {
              "id": 450224,
              "pid": 4502,
              "level": "district",
              "name": "融安县"
            },
            {
              "id": 450225,
              "pid": 4502,
              "level": "district",
              "name": "融水苗族自治县"
            },
            {
              "id": 450226,
              "pid": 4502,
              "level": "district",
              "name": "三江侗族自治县"
            }
          ]
        },
        {
          "id": 4503,
          "pid": 45,
          "level": "city",
          "name": "桂林市",
          "children": [
            {
              "id": 450302,
              "pid": 4503,
              "level": "district",
              "name": "秀峰区"
            },
            {
              "id": 450303,
              "pid": 4503,
              "level": "district",
              "name": "叠彩区"
            },
            {
              "id": 450304,
              "pid": 4503,
              "level": "district",
              "name": "象山区"
            },
            {
              "id": 450305,
              "pid": 4503,
              "level": "district",
              "name": "七星区"
            },
            {
              "id": 450311,
              "pid": 4503,
              "level": "district",
              "name": "雁山区"
            },
            {
              "id": 450312,
              "pid": 4503,
              "level": "district",
              "name": "临桂区"
            },
            {
              "id": 450321,
              "pid": 4503,
              "level": "district",
              "name": "阳朔县"
            },
            {
              "id": 450323,
              "pid": 4503,
              "level": "district",
              "name": "灵川县"
            },
            {
              "id": 450324,
              "pid": 4503,
              "level": "district",
              "name": "全州县"
            },
            {
              "id": 450325,
              "pid": 4503,
              "level": "district",
              "name": "兴安县"
            },
            {
              "id": 450326,
              "pid": 4503,
              "level": "district",
              "name": "永福县"
            },
            {
              "id": 450327,
              "pid": 4503,
              "level": "district",
              "name": "灌阳县"
            },
            {
              "id": 450328,
              "pid": 4503,
              "level": "district",
              "name": "龙胜各族自治县"
            },
            {
              "id": 450329,
              "pid": 4503,
              "level": "district",
              "name": "资源县"
            },
            {
              "id": 450330,
              "pid": 4503,
              "level": "district",
              "name": "平乐县"
            },
            {
              "id": 450332,
              "pid": 4503,
              "level": "district",
              "name": "恭城瑶族自治县"
            },
            {
              "id": 450381,
              "pid": 4503,
              "level": "district",
              "name": "荔浦市"
            }
          ]
        },
        {
          "id": 4504,
          "pid": 45,
          "level": "city",
          "name": "梧州市",
          "children": [
            {
              "id": 450403,
              "pid": 4504,
              "level": "district",
              "name": "万秀区"
            },
            {
              "id": 450405,
              "pid": 4504,
              "level": "district",
              "name": "长洲区"
            },
            {
              "id": 450406,
              "pid": 4504,
              "level": "district",
              "name": "龙圩区"
            },
            {
              "id": 450421,
              "pid": 4504,
              "level": "district",
              "name": "苍梧县"
            },
            {
              "id": 450422,
              "pid": 4504,
              "level": "district",
              "name": "藤县"
            },
            {
              "id": 450423,
              "pid": 4504,
              "level": "district",
              "name": "蒙山县"
            },
            {
              "id": 450481,
              "pid": 4504,
              "level": "district",
              "name": "岑溪市"
            }
          ]
        },
        {
          "id": 4505,
          "pid": 45,
          "level": "city",
          "name": "北海市",
          "children": [
            {
              "id": 450502,
              "pid": 4505,
              "level": "district",
              "name": "海城区"
            },
            {
              "id": 450503,
              "pid": 4505,
              "level": "district",
              "name": "银海区"
            },
            {
              "id": 450512,
              "pid": 4505,
              "level": "district",
              "name": "铁山港区"
            },
            {
              "id": 450521,
              "pid": 4505,
              "level": "district",
              "name": "合浦县"
            }
          ]
        },
        {
          "id": 4506,
          "pid": 45,
          "level": "city",
          "name": "防城港市",
          "children": [
            {
              "id": 450602,
              "pid": 4506,
              "level": "district",
              "name": "港口区"
            },
            {
              "id": 450603,
              "pid": 4506,
              "level": "district",
              "name": "防城区"
            },
            {
              "id": 450621,
              "pid": 4506,
              "level": "district",
              "name": "上思县"
            },
            {
              "id": 450681,
              "pid": 4506,
              "level": "district",
              "name": "东兴市"
            }
          ]
        },
        {
          "id": 4507,
          "pid": 45,
          "level": "city",
          "name": "钦州市",
          "children": [
            {
              "id": 450702,
              "pid": 4507,
              "level": "district",
              "name": "钦南区"
            },
            {
              "id": 450703,
              "pid": 4507,
              "level": "district",
              "name": "钦北区"
            },
            {
              "id": 450721,
              "pid": 4507,
              "level": "district",
              "name": "灵山县"
            },
            {
              "id": 450722,
              "pid": 4507,
              "level": "district",
              "name": "浦北县"
            }
          ]
        },
        {
          "id": 4508,
          "pid": 45,
          "level": "city",
          "name": "贵港市",
          "children": [
            {
              "id": 450802,
              "pid": 4508,
              "level": "district",
              "name": "港北区"
            },
            {
              "id": 450803,
              "pid": 4508,
              "level": "district",
              "name": "港南区"
            },
            {
              "id": 450804,
              "pid": 4508,
              "level": "district",
              "name": "覃塘区"
            },
            {
              "id": 450821,
              "pid": 4508,
              "level": "district",
              "name": "平南县"
            },
            {
              "id": 450881,
              "pid": 4508,
              "level": "district",
              "name": "桂平市"
            }
          ]
        },
        {
          "id": 4509,
          "pid": 45,
          "level": "city",
          "name": "玉林市",
          "children": [
            {
              "id": 450902,
              "pid": 4509,
              "level": "district",
              "name": "玉州区"
            },
            {
              "id": 450903,
              "pid": 4509,
              "level": "district",
              "name": "福绵区"
            },
            {
              "id": 450921,
              "pid": 4509,
              "level": "district",
              "name": "容县"
            },
            {
              "id": 450922,
              "pid": 4509,
              "level": "district",
              "name": "陆川县"
            },
            {
              "id": 450923,
              "pid": 4509,
              "level": "district",
              "name": "博白县"
            },
            {
              "id": 450924,
              "pid": 4509,
              "level": "district",
              "name": "兴业县"
            },
            {
              "id": 450981,
              "pid": 4509,
              "level": "district",
              "name": "北流市"
            }
          ]
        },
        {
          "id": 4510,
          "pid": 45,
          "level": "city",
          "name": "百色市",
          "children": [
            {
              "id": 451002,
              "pid": 4510,
              "level": "district",
              "name": "右江区"
            },
            {
              "id": 451003,
              "pid": 4510,
              "level": "district",
              "name": "田阳区"
            },
            {
              "id": 451022,
              "pid": 4510,
              "level": "district",
              "name": "田东县"
            },
            {
              "id": 451024,
              "pid": 4510,
              "level": "district",
              "name": "德保县"
            },
            {
              "id": 451026,
              "pid": 4510,
              "level": "district",
              "name": "那坡县"
            },
            {
              "id": 451027,
              "pid": 4510,
              "level": "district",
              "name": "凌云县"
            },
            {
              "id": 451028,
              "pid": 4510,
              "level": "district",
              "name": "乐业县"
            },
            {
              "id": 451029,
              "pid": 4510,
              "level": "district",
              "name": "田林县"
            },
            {
              "id": 451030,
              "pid": 4510,
              "level": "district",
              "name": "西林县"
            },
            {
              "id": 451031,
              "pid": 4510,
              "level": "district",
              "name": "隆林各族自治县"
            },
            {
              "id": 451081,
              "pid": 4510,
              "level": "district",
              "name": "靖西市"
            },
            {
              "id": 451082,
              "pid": 4510,
              "level": "district",
              "name": "平果市"
            }
          ]
        },
        {
          "id": 4511,
          "pid": 45,
          "level": "city",
          "name": "贺州市",
          "children": [
            {
              "id": 451102,
              "pid": 4511,
              "level": "district",
              "name": "八步区"
            },
            {
              "id": 451103,
              "pid": 4511,
              "level": "district",
              "name": "平桂区"
            },
            {
              "id": 451121,
              "pid": 4511,
              "level": "district",
              "name": "昭平县"
            },
            {
              "id": 451122,
              "pid": 4511,
              "level": "district",
              "name": "钟山县"
            },
            {
              "id": 451123,
              "pid": 4511,
              "level": "district",
              "name": "富川瑶族自治县"
            }
          ]
        },
        {
          "id": 4512,
          "pid": 45,
          "level": "city",
          "name": "河池市",
          "children": [
            {
              "id": 451202,
              "pid": 4512,
              "level": "district",
              "name": "金城江区"
            },
            {
              "id": 451203,
              "pid": 4512,
              "level": "district",
              "name": "宜州区"
            },
            {
              "id": 451221,
              "pid": 4512,
              "level": "district",
              "name": "南丹县"
            },
            {
              "id": 451222,
              "pid": 4512,
              "level": "district",
              "name": "天峨县"
            },
            {
              "id": 451223,
              "pid": 4512,
              "level": "district",
              "name": "凤山县"
            },
            {
              "id": 451224,
              "pid": 4512,
              "level": "district",
              "name": "东兰县"
            },
            {
              "id": 451225,
              "pid": 4512,
              "level": "district",
              "name": "罗城仫佬族自治县"
            },
            {
              "id": 451226,
              "pid": 4512,
              "level": "district",
              "name": "环江毛南族自治县"
            },
            {
              "id": 451227,
              "pid": 4512,
              "level": "district",
              "name": "巴马瑶族自治县"
            },
            {
              "id": 451228,
              "pid": 4512,
              "level": "district",
              "name": "都安瑶族自治县"
            },
            {
              "id": 451229,
              "pid": 4512,
              "level": "district",
              "name": "大化瑶族自治县"
            }
          ]
        },
        {
          "id": 4513,
          "pid": 45,
          "level": "city",
          "name": "来宾市",
          "children": [
            {
              "id": 451302,
              "pid": 4513,
              "level": "district",
              "name": "兴宾区"
            },
            {
              "id": 451321,
              "pid": 4513,
              "level": "district",
              "name": "忻城县"
            },
            {
              "id": 451322,
              "pid": 4513,
              "level": "district",
              "name": "象州县"
            },
            {
              "id": 451323,
              "pid": 4513,
              "level": "district",
              "name": "武宣县"
            },
            {
              "id": 451324,
              "pid": 4513,
              "level": "district",
              "name": "金秀瑶族自治县"
            },
            {
              "id": 451381,
              "pid": 4513,
              "level": "district",
              "name": "合山市"
            }
          ]
        },
        {
          "id": 4514,
          "pid": 45,
          "level": "city",
          "name": "崇左市",
          "children": [
            {
              "id": 451402,
              "pid": 4514,
              "level": "district",
              "name": "江州区"
            },
            {
              "id": 451421,
              "pid": 4514,
              "level": "district",
              "name": "扶绥县"
            },
            {
              "id": 451422,
              "pid": 4514,
              "level": "district",
              "name": "宁明县"
            },
            {
              "id": 451423,
              "pid": 4514,
              "level": "district",
              "name": "龙州县"
            },
            {
              "id": 451424,
              "pid": 4514,
              "level": "district",
              "name": "大新县"
            },
            {
              "id": 451425,
              "pid": 4514,
              "level": "district",
              "name": "天等县"
            },
            {
              "id": 451481,
              "pid": 4514,
              "level": "district",
              "name": "凭祥市"
            }
          ]
        }
      ]
    },
    {
      "id": 46,
      "pid": 0,
      "level": "province",
      "name": "海南省",
      "children": [
        {
          "id": 4601,
          "pid": 46,
          "level": "city",
          "name": "海口市",
          "children": [
            {
              "id": 460105,
              "pid": 4601,
              "level": "district",
              "name": "秀英区"
            },
            {
              "id": 460106,
              "pid": 4601,
              "level": "district",
              "name": "龙华区"
            },
            {
              "id": 460107,
              "pid": 4601,
              "level": "district",
              "name": "琼山区"
            },
            {
              "id": 460108,
              "pid": 4601,
              "level": "district",
              "name": "美兰区"
            }
          ]
        },
        {
          "id": 4602,
          "pid": 46,
          "level": "city",
          "name": "三亚市",
          "children": [
            {
              "id": 460202,
              "pid": 4602,
              "level": "district",
              "name": "海棠区"
            },
            {
              "id": 460203,
              "pid": 4602,
              "level": "district",
              "name": "吉阳区"
            },
            {
              "id": 460204,
              "pid": 4602,
              "level": "district",
              "name": "天涯区"
            },
            {
              "id": 460205,
              "pid": 4602,
              "level": "district",
              "name": "崖州区"
            }
          ]
        },
        {
          "id": 4603,
          "pid": 46,
          "level": "city",
          "name": "三沙市",
          "children": [
            {
              "id": 460321,
              "pid": 4603,
              "level": "district",
              "name": "西沙群岛"
            },
            {
              "id": 460322,
              "pid": 4603,
              "level": "district",
              "name": "南沙群岛"
            },
            {
              "id": 460323,
              "pid": 4603,
              "level": "district",
              "name": "中沙群岛的岛礁及其海域"
            }
          ]
        },
        {
          "id": 4604,
          "pid": 46,
          "level": "city",
          "name": "儋州市",
          "children": [
            {
              "id": 460400,
              "pid": 4604,
              "level": "district",
              "name": "儋州市"
            }
          ]
        },
        {
          "id": 4690,
          "pid": 46,
          "level": "city",
          "name": "省直辖县级行政区划",
          "children": [
            {
              "id": 469001,
              "pid": 4690,
              "level": "district",
              "name": "五指山市"
            },
            {
              "id": 469002,
              "pid": 4690,
              "level": "district",
              "name": "琼海市"
            },
            {
              "id": 469005,
              "pid": 4690,
              "level": "district",
              "name": "文昌市"
            },
            {
              "id": 469006,
              "pid": 4690,
              "level": "district",
              "name": "万宁市"
            },
            {
              "id": 469007,
              "pid": 4690,
              "level": "district",
              "name": "东方市"
            },
            {
              "id": 469021,
              "pid": 4690,
              "level": "district",
              "name": "定安县"
            },
            {
              "id": 469022,
              "pid": 4690,
              "level": "district",
              "name": "屯昌县"
            },
            {
              "id": 469023,
              "pid": 4690,
              "level": "district",
              "name": "澄迈县"
            },
            {
              "id": 469024,
              "pid": 4690,
              "level": "district",
              "name": "临高县"
            },
            {
              "id": 469025,
              "pid": 4690,
              "level": "district",
              "name": "白沙黎族自治县"
            },
            {
              "id": 469026,
              "pid": 4690,
              "level": "district",
              "name": "昌江黎族自治县"
            },
            {
              "id": 469027,
              "pid": 4690,
              "level": "district",
              "name": "乐东黎族自治县"
            },
            {
              "id": 469028,
              "pid": 4690,
              "level": "district",
              "name": "陵水黎族自治县"
            },
            {
              "id": 469029,
              "pid": 4690,
              "level": "district",
              "name": "保亭黎族苗族自治县"
            },
            {
              "id": 469030,
              "pid": 4690,
              "level": "district",
              "name": "琼中黎族苗族自治县"
            }
          ]
        }
      ]
    },
    {
      "id": 50,
      "pid": 0,
      "level": "province",
      "name": "重庆市",
      "children": [
        {
          "id": 5001,
          "pid": 50,
          "level": "city",
          "name": "市辖区",
          "children": [
            {
              "id": 500101,
              "pid": 5001,
              "level": "district",
              "name": "万州区"
            },
            {
              "id": 500102,
              "pid": 5001,
              "level": "district",
              "name": "涪陵区"
            },
            {
              "id": 500103,
              "pid": 5001,
              "level": "district",
              "name": "渝中区"
            },
            {
              "id": 500104,
              "pid": 5001,
              "level": "district",
              "name": "大渡口区"
            },
            {
              "id": 500105,
              "pid": 5001,
              "level": "district",
              "name": "江北区"
            },
            {
              "id": 500106,
              "pid": 5001,
              "level": "district",
              "name": "沙坪坝区"
            },
            {
              "id": 500107,
              "pid": 5001,
              "level": "district",
              "name": "九龙坡区"
            },
            {
              "id": 500108,
              "pid": 5001,
              "level": "district",
              "name": "南岸区"
            },
            {
              "id": 500109,
              "pid": 5001,
              "level": "district",
              "name": "北碚区"
            },
            {
              "id": 500110,
              "pid": 5001,
              "level": "district",
              "name": "綦江区"
            },
            {
              "id": 500111,
              "pid": 5001,
              "level": "district",
              "name": "大足区"
            },
            {
              "id": 500112,
              "pid": 5001,
              "level": "district",
              "name": "渝北区"
            },
            {
              "id": 500113,
              "pid": 5001,
              "level": "district",
              "name": "巴南区"
            },
            {
              "id": 500114,
              "pid": 5001,
              "level": "district",
              "name": "黔江区"
            },
            {
              "id": 500115,
              "pid": 5001,
              "level": "district",
              "name": "长寿区"
            },
            {
              "id": 500116,
              "pid": 5001,
              "level": "district",
              "name": "江津区"
            },
            {
              "id": 500117,
              "pid": 5001,
              "level": "district",
              "name": "合川区"
            },
            {
              "id": 500118,
              "pid": 5001,
              "level": "district",
              "name": "永川区"
            },
            {
              "id": 500119,
              "pid": 5001,
              "level": "district",
              "name": "南川区"
            },
            {
              "id": 500120,
              "pid": 5001,
              "level": "district",
              "name": "璧山区"
            },
            {
              "id": 500151,
              "pid": 5001,
              "level": "district",
              "name": "铜梁区"
            },
            {
              "id": 500152,
              "pid": 5001,
              "level": "district",
              "name": "潼南区"
            },
            {
              "id": 500153,
              "pid": 5001,
              "level": "district",
              "name": "荣昌区"
            },
            {
              "id": 500154,
              "pid": 5001,
              "level": "district",
              "name": "开州区"
            },
            {
              "id": 500155,
              "pid": 5001,
              "level": "district",
              "name": "梁平区"
            },
            {
              "id": 500156,
              "pid": 5001,
              "level": "district",
              "name": "武隆区"
            }
          ]
        },
        {
          "id": 5002,
          "pid": 50,
          "level": "city",
          "name": "县",
          "children": [
            {
              "id": 500229,
              "pid": 5002,
              "level": "district",
              "name": "城口县"
            },
            {
              "id": 500230,
              "pid": 5002,
              "level": "district",
              "name": "丰都县"
            },
            {
              "id": 500231,
              "pid": 5002,
              "level": "district",
              "name": "垫江县"
            },
            {
              "id": 500233,
              "pid": 5002,
              "level": "district",
              "name": "忠县"
            },
            {
              "id": 500235,
              "pid": 5002,
              "level": "district",
              "name": "云阳县"
            },
            {
              "id": 500236,
              "pid": 5002,
              "level": "district",
              "name": "奉节县"
            },
            {
              "id": 500237,
              "pid": 5002,
              "level": "district",
              "name": "巫山县"
            },
            {
              "id": 500238,
              "pid": 5002,
              "level": "district",
              "name": "巫溪县"
            },
            {
              "id": 500240,
              "pid": 5002,
              "level": "district",
              "name": "石柱土家族自治县"
            },
            {
              "id": 500241,
              "pid": 5002,
              "level": "district",
              "name": "秀山土家族苗族自治县"
            },
            {
              "id": 500242,
              "pid": 5002,
              "level": "district",
              "name": "酉阳土家族苗族自治县"
            },
            {
              "id": 500243,
              "pid": 5002,
              "level": "district",
              "name": "彭水苗族土家族自治县"
            }
          ]
        }
      ]
    },
    {
      "id": 51,
      "pid": 0,
      "level": "province",
      "name": "四川省",
      "children": [
        {
          "id": 5101,
          "pid": 51,
          "level": "city",
          "name": "成都市",
          "children": [
            {
              "id": 510104,
              "pid": 5101,
              "level": "district",
              "name": "锦江区"
            },
            {
              "id": 510105,
              "pid": 5101,
              "level": "district",
              "name": "青羊区"
            },
            {
              "id": 510106,
              "pid": 5101,
              "level": "district",
              "name": "金牛区"
            },
            {
              "id": 510107,
              "pid": 5101,
              "level": "district",
              "name": "武侯区"
            },
            {
              "id": 510108,
              "pid": 5101,
              "level": "district",
              "name": "成华区"
            },
            {
              "id": 510112,
              "pid": 5101,
              "level": "district",
              "name": "龙泉驿区"
            },
            {
              "id": 510113,
              "pid": 5101,
              "level": "district",
              "name": "青白江区"
            },
            {
              "id": 510114,
              "pid": 5101,
              "level": "district",
              "name": "新都区"
            },
            {
              "id": 510115,
              "pid": 5101,
              "level": "district",
              "name": "温江区"
            },
            {
              "id": 510116,
              "pid": 5101,
              "level": "district",
              "name": "双流区"
            },
            {
              "id": 510117,
              "pid": 5101,
              "level": "district",
              "name": "郫都区"
            },
            {
              "id": 510118,
              "pid": 5101,
              "level": "district",
              "name": "新津区"
            },
            {
              "id": 510121,
              "pid": 5101,
              "level": "district",
              "name": "金堂县"
            },
            {
              "id": 510129,
              "pid": 5101,
              "level": "district",
              "name": "大邑县"
            },
            {
              "id": 510131,
              "pid": 5101,
              "level": "district",
              "name": "蒲江县"
            },
            {
              "id": 510181,
              "pid": 5101,
              "level": "district",
              "name": "都江堰市"
            },
            {
              "id": 510182,
              "pid": 5101,
              "level": "district",
              "name": "彭州市"
            },
            {
              "id": 510183,
              "pid": 5101,
              "level": "district",
              "name": "邛崃市"
            },
            {
              "id": 510184,
              "pid": 5101,
              "level": "district",
              "name": "崇州市"
            },
            {
              "id": 510185,
              "pid": 5101,
              "level": "district",
              "name": "简阳市"
            }
          ]
        },
        {
          "id": 5103,
          "pid": 51,
          "level": "city",
          "name": "自贡市",
          "children": [
            {
              "id": 510302,
              "pid": 5103,
              "level": "district",
              "name": "自流井区"
            },
            {
              "id": 510303,
              "pid": 5103,
              "level": "district",
              "name": "贡井区"
            },
            {
              "id": 510304,
              "pid": 5103,
              "level": "district",
              "name": "大安区"
            },
            {
              "id": 510311,
              "pid": 5103,
              "level": "district",
              "name": "沿滩区"
            },
            {
              "id": 510321,
              "pid": 5103,
              "level": "district",
              "name": "荣县"
            },
            {
              "id": 510322,
              "pid": 5103,
              "level": "district",
              "name": "富顺县"
            }
          ]
        },
        {
          "id": 5104,
          "pid": 51,
          "level": "city",
          "name": "攀枝花市",
          "children": [
            {
              "id": 510402,
              "pid": 5104,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 510403,
              "pid": 5104,
              "level": "district",
              "name": "西区"
            },
            {
              "id": 510411,
              "pid": 5104,
              "level": "district",
              "name": "仁和区"
            },
            {
              "id": 510421,
              "pid": 5104,
              "level": "district",
              "name": "米易县"
            },
            {
              "id": 510422,
              "pid": 5104,
              "level": "district",
              "name": "盐边县"
            }
          ]
        },
        {
          "id": 5105,
          "pid": 51,
          "level": "city",
          "name": "泸州市",
          "children": [
            {
              "id": 510502,
              "pid": 5105,
              "level": "district",
              "name": "江阳区"
            },
            {
              "id": 510503,
              "pid": 5105,
              "level": "district",
              "name": "纳溪区"
            },
            {
              "id": 510504,
              "pid": 5105,
              "level": "district",
              "name": "龙马潭区"
            },
            {
              "id": 510521,
              "pid": 5105,
              "level": "district",
              "name": "泸县"
            },
            {
              "id": 510522,
              "pid": 5105,
              "level": "district",
              "name": "合江县"
            },
            {
              "id": 510524,
              "pid": 5105,
              "level": "district",
              "name": "叙永县"
            },
            {
              "id": 510525,
              "pid": 5105,
              "level": "district",
              "name": "古蔺县"
            }
          ]
        },
        {
          "id": 5106,
          "pid": 51,
          "level": "city",
          "name": "德阳市",
          "children": [
            {
              "id": 510603,
              "pid": 5106,
              "level": "district",
              "name": "旌阳区"
            },
            {
              "id": 510604,
              "pid": 5106,
              "level": "district",
              "name": "罗江区"
            },
            {
              "id": 510623,
              "pid": 5106,
              "level": "district",
              "name": "中江县"
            },
            {
              "id": 510681,
              "pid": 5106,
              "level": "district",
              "name": "广汉市"
            },
            {
              "id": 510682,
              "pid": 5106,
              "level": "district",
              "name": "什邡市"
            },
            {
              "id": 510683,
              "pid": 5106,
              "level": "district",
              "name": "绵竹市"
            }
          ]
        },
        {
          "id": 5107,
          "pid": 51,
          "level": "city",
          "name": "绵阳市",
          "children": [
            {
              "id": 510703,
              "pid": 5107,
              "level": "district",
              "name": "涪城区"
            },
            {
              "id": 510704,
              "pid": 5107,
              "level": "district",
              "name": "游仙区"
            },
            {
              "id": 510705,
              "pid": 5107,
              "level": "district",
              "name": "安州区"
            },
            {
              "id": 510722,
              "pid": 5107,
              "level": "district",
              "name": "三台县"
            },
            {
              "id": 510723,
              "pid": 5107,
              "level": "district",
              "name": "盐亭县"
            },
            {
              "id": 510725,
              "pid": 5107,
              "level": "district",
              "name": "梓潼县"
            },
            {
              "id": 510726,
              "pid": 5107,
              "level": "district",
              "name": "北川羌族自治县"
            },
            {
              "id": 510727,
              "pid": 5107,
              "level": "district",
              "name": "平武县"
            },
            {
              "id": 510781,
              "pid": 5107,
              "level": "district",
              "name": "江油市"
            }
          ]
        },
        {
          "id": 5108,
          "pid": 51,
          "level": "city",
          "name": "广元市",
          "children": [
            {
              "id": 510802,
              "pid": 5108,
              "level": "district",
              "name": "利州区"
            },
            {
              "id": 510811,
              "pid": 5108,
              "level": "district",
              "name": "昭化区"
            },
            {
              "id": 510812,
              "pid": 5108,
              "level": "district",
              "name": "朝天区"
            },
            {
              "id": 510821,
              "pid": 5108,
              "level": "district",
              "name": "旺苍县"
            },
            {
              "id": 510822,
              "pid": 5108,
              "level": "district",
              "name": "青川县"
            },
            {
              "id": 510823,
              "pid": 5108,
              "level": "district",
              "name": "剑阁县"
            },
            {
              "id": 510824,
              "pid": 5108,
              "level": "district",
              "name": "苍溪县"
            }
          ]
        },
        {
          "id": 5109,
          "pid": 51,
          "level": "city",
          "name": "遂宁市",
          "children": [
            {
              "id": 510903,
              "pid": 5109,
              "level": "district",
              "name": "船山区"
            },
            {
              "id": 510904,
              "pid": 5109,
              "level": "district",
              "name": "安居区"
            },
            {
              "id": 510921,
              "pid": 5109,
              "level": "district",
              "name": "蓬溪县"
            },
            {
              "id": 510923,
              "pid": 5109,
              "level": "district",
              "name": "大英县"
            },
            {
              "id": 510981,
              "pid": 5109,
              "level": "district",
              "name": "射洪市"
            }
          ]
        },
        {
          "id": 5110,
          "pid": 51,
          "level": "city",
          "name": "内江市",
          "children": [
            {
              "id": 511002,
              "pid": 5110,
              "level": "district",
              "name": "市中区"
            },
            {
              "id": 511011,
              "pid": 5110,
              "level": "district",
              "name": "东兴区"
            },
            {
              "id": 511024,
              "pid": 5110,
              "level": "district",
              "name": "威远县"
            },
            {
              "id": 511025,
              "pid": 5110,
              "level": "district",
              "name": "资中县"
            },
            {
              "id": 511071,
              "pid": 5110,
              "level": "district",
              "name": "内江经济开发区"
            },
            {
              "id": 511083,
              "pid": 5110,
              "level": "district",
              "name": "隆昌市"
            }
          ]
        },
        {
          "id": 5111,
          "pid": 51,
          "level": "city",
          "name": "乐山市",
          "children": [
            {
              "id": 511102,
              "pid": 5111,
              "level": "district",
              "name": "市中区"
            },
            {
              "id": 511111,
              "pid": 5111,
              "level": "district",
              "name": "沙湾区"
            },
            {
              "id": 511112,
              "pid": 5111,
              "level": "district",
              "name": "五通桥区"
            },
            {
              "id": 511113,
              "pid": 5111,
              "level": "district",
              "name": "金口河区"
            },
            {
              "id": 511123,
              "pid": 5111,
              "level": "district",
              "name": "犍为县"
            },
            {
              "id": 511124,
              "pid": 5111,
              "level": "district",
              "name": "井研县"
            },
            {
              "id": 511126,
              "pid": 5111,
              "level": "district",
              "name": "夹江县"
            },
            {
              "id": 511129,
              "pid": 5111,
              "level": "district",
              "name": "沐川县"
            },
            {
              "id": 511132,
              "pid": 5111,
              "level": "district",
              "name": "峨边彝族自治县"
            },
            {
              "id": 511133,
              "pid": 5111,
              "level": "district",
              "name": "马边彝族自治县"
            },
            {
              "id": 511181,
              "pid": 5111,
              "level": "district",
              "name": "峨眉山市"
            }
          ]
        },
        {
          "id": 5113,
          "pid": 51,
          "level": "city",
          "name": "南充市",
          "children": [
            {
              "id": 511302,
              "pid": 5113,
              "level": "district",
              "name": "顺庆区"
            },
            {
              "id": 511303,
              "pid": 5113,
              "level": "district",
              "name": "高坪区"
            },
            {
              "id": 511304,
              "pid": 5113,
              "level": "district",
              "name": "嘉陵区"
            },
            {
              "id": 511321,
              "pid": 5113,
              "level": "district",
              "name": "南部县"
            },
            {
              "id": 511322,
              "pid": 5113,
              "level": "district",
              "name": "营山县"
            },
            {
              "id": 511323,
              "pid": 5113,
              "level": "district",
              "name": "蓬安县"
            },
            {
              "id": 511324,
              "pid": 5113,
              "level": "district",
              "name": "仪陇县"
            },
            {
              "id": 511325,
              "pid": 5113,
              "level": "district",
              "name": "西充县"
            },
            {
              "id": 511381,
              "pid": 5113,
              "level": "district",
              "name": "阆中市"
            }
          ]
        },
        {
          "id": 5114,
          "pid": 51,
          "level": "city",
          "name": "眉山市",
          "children": [
            {
              "id": 511402,
              "pid": 5114,
              "level": "district",
              "name": "东坡区"
            },
            {
              "id": 511403,
              "pid": 5114,
              "level": "district",
              "name": "彭山区"
            },
            {
              "id": 511421,
              "pid": 5114,
              "level": "district",
              "name": "仁寿县"
            },
            {
              "id": 511423,
              "pid": 5114,
              "level": "district",
              "name": "洪雅县"
            },
            {
              "id": 511424,
              "pid": 5114,
              "level": "district",
              "name": "丹棱县"
            },
            {
              "id": 511425,
              "pid": 5114,
              "level": "district",
              "name": "青神县"
            }
          ]
        },
        {
          "id": 5115,
          "pid": 51,
          "level": "city",
          "name": "宜宾市",
          "children": [
            {
              "id": 511502,
              "pid": 5115,
              "level": "district",
              "name": "翠屏区"
            },
            {
              "id": 511503,
              "pid": 5115,
              "level": "district",
              "name": "南溪区"
            },
            {
              "id": 511504,
              "pid": 5115,
              "level": "district",
              "name": "叙州区"
            },
            {
              "id": 511523,
              "pid": 5115,
              "level": "district",
              "name": "江安县"
            },
            {
              "id": 511524,
              "pid": 5115,
              "level": "district",
              "name": "长宁县"
            },
            {
              "id": 511525,
              "pid": 5115,
              "level": "district",
              "name": "高县"
            },
            {
              "id": 511526,
              "pid": 5115,
              "level": "district",
              "name": "珙县"
            },
            {
              "id": 511527,
              "pid": 5115,
              "level": "district",
              "name": "筠连县"
            },
            {
              "id": 511528,
              "pid": 5115,
              "level": "district",
              "name": "兴文县"
            },
            {
              "id": 511529,
              "pid": 5115,
              "level": "district",
              "name": "屏山县"
            }
          ]
        },
        {
          "id": 5116,
          "pid": 51,
          "level": "city",
          "name": "广安市",
          "children": [
            {
              "id": 511602,
              "pid": 5116,
              "level": "district",
              "name": "广安区"
            },
            {
              "id": 511603,
              "pid": 5116,
              "level": "district",
              "name": "前锋区"
            },
            {
              "id": 511621,
              "pid": 5116,
              "level": "district",
              "name": "岳池县"
            },
            {
              "id": 511622,
              "pid": 5116,
              "level": "district",
              "name": "武胜县"
            },
            {
              "id": 511623,
              "pid": 5116,
              "level": "district",
              "name": "邻水县"
            },
            {
              "id": 511681,
              "pid": 5116,
              "level": "district",
              "name": "华蓥市"
            }
          ]
        },
        {
          "id": 5117,
          "pid": 51,
          "level": "city",
          "name": "达州市",
          "children": [
            {
              "id": 511702,
              "pid": 5117,
              "level": "district",
              "name": "通川区"
            },
            {
              "id": 511703,
              "pid": 5117,
              "level": "district",
              "name": "达川区"
            },
            {
              "id": 511722,
              "pid": 5117,
              "level": "district",
              "name": "宣汉县"
            },
            {
              "id": 511723,
              "pid": 5117,
              "level": "district",
              "name": "开江县"
            },
            {
              "id": 511724,
              "pid": 5117,
              "level": "district",
              "name": "大竹县"
            },
            {
              "id": 511725,
              "pid": 5117,
              "level": "district",
              "name": "渠县"
            },
            {
              "id": 511771,
              "pid": 5117,
              "level": "district",
              "name": "达州经济开发区"
            },
            {
              "id": 511781,
              "pid": 5117,
              "level": "district",
              "name": "万源市"
            }
          ]
        },
        {
          "id": 5118,
          "pid": 51,
          "level": "city",
          "name": "雅安市",
          "children": [
            {
              "id": 511802,
              "pid": 5118,
              "level": "district",
              "name": "雨城区"
            },
            {
              "id": 511803,
              "pid": 5118,
              "level": "district",
              "name": "名山区"
            },
            {
              "id": 511822,
              "pid": 5118,
              "level": "district",
              "name": "荥经县"
            },
            {
              "id": 511823,
              "pid": 5118,
              "level": "district",
              "name": "汉源县"
            },
            {
              "id": 511824,
              "pid": 5118,
              "level": "district",
              "name": "石棉县"
            },
            {
              "id": 511825,
              "pid": 5118,
              "level": "district",
              "name": "天全县"
            },
            {
              "id": 511826,
              "pid": 5118,
              "level": "district",
              "name": "芦山县"
            },
            {
              "id": 511827,
              "pid": 5118,
              "level": "district",
              "name": "宝兴县"
            }
          ]
        },
        {
          "id": 5119,
          "pid": 51,
          "level": "city",
          "name": "巴中市",
          "children": [
            {
              "id": 511902,
              "pid": 5119,
              "level": "district",
              "name": "巴州区"
            },
            {
              "id": 511903,
              "pid": 5119,
              "level": "district",
              "name": "恩阳区"
            },
            {
              "id": 511921,
              "pid": 5119,
              "level": "district",
              "name": "通江县"
            },
            {
              "id": 511922,
              "pid": 5119,
              "level": "district",
              "name": "南江县"
            },
            {
              "id": 511923,
              "pid": 5119,
              "level": "district",
              "name": "平昌县"
            },
            {
              "id": 511971,
              "pid": 5119,
              "level": "district",
              "name": "巴中经济开发区"
            }
          ]
        },
        {
          "id": 5120,
          "pid": 51,
          "level": "city",
          "name": "资阳市",
          "children": [
            {
              "id": 512002,
              "pid": 5120,
              "level": "district",
              "name": "雁江区"
            },
            {
              "id": 512021,
              "pid": 5120,
              "level": "district",
              "name": "安岳县"
            },
            {
              "id": 512022,
              "pid": 5120,
              "level": "district",
              "name": "乐至县"
            }
          ]
        },
        {
          "id": 5132,
          "pid": 51,
          "level": "city",
          "name": "阿坝藏族羌族自治州",
          "children": [
            {
              "id": 513201,
              "pid": 5132,
              "level": "district",
              "name": "马尔康市"
            },
            {
              "id": 513221,
              "pid": 5132,
              "level": "district",
              "name": "汶川县"
            },
            {
              "id": 513222,
              "pid": 5132,
              "level": "district",
              "name": "理县"
            },
            {
              "id": 513223,
              "pid": 5132,
              "level": "district",
              "name": "茂县"
            },
            {
              "id": 513224,
              "pid": 5132,
              "level": "district",
              "name": "松潘县"
            },
            {
              "id": 513225,
              "pid": 5132,
              "level": "district",
              "name": "九寨沟县"
            },
            {
              "id": 513226,
              "pid": 5132,
              "level": "district",
              "name": "金川县"
            },
            {
              "id": 513227,
              "pid": 5132,
              "level": "district",
              "name": "小金县"
            },
            {
              "id": 513228,
              "pid": 5132,
              "level": "district",
              "name": "黑水县"
            },
            {
              "id": 513230,
              "pid": 5132,
              "level": "district",
              "name": "壤塘县"
            },
            {
              "id": 513231,
              "pid": 5132,
              "level": "district",
              "name": "阿坝县"
            },
            {
              "id": 513232,
              "pid": 5132,
              "level": "district",
              "name": "若尔盖县"
            },
            {
              "id": 513233,
              "pid": 5132,
              "level": "district",
              "name": "红原县"
            }
          ]
        },
        {
          "id": 5133,
          "pid": 51,
          "level": "city",
          "name": "甘孜藏族自治州",
          "children": [
            {
              "id": 513301,
              "pid": 5133,
              "level": "district",
              "name": "康定市"
            },
            {
              "id": 513322,
              "pid": 5133,
              "level": "district",
              "name": "泸定县"
            },
            {
              "id": 513323,
              "pid": 5133,
              "level": "district",
              "name": "丹巴县"
            },
            {
              "id": 513324,
              "pid": 5133,
              "level": "district",
              "name": "九龙县"
            },
            {
              "id": 513325,
              "pid": 5133,
              "level": "district",
              "name": "雅江县"
            },
            {
              "id": 513326,
              "pid": 5133,
              "level": "district",
              "name": "道孚县"
            },
            {
              "id": 513327,
              "pid": 5133,
              "level": "district",
              "name": "炉霍县"
            },
            {
              "id": 513328,
              "pid": 5133,
              "level": "district",
              "name": "甘孜县"
            },
            {
              "id": 513329,
              "pid": 5133,
              "level": "district",
              "name": "新龙县"
            },
            {
              "id": 513330,
              "pid": 5133,
              "level": "district",
              "name": "德格县"
            },
            {
              "id": 513331,
              "pid": 5133,
              "level": "district",
              "name": "白玉县"
            },
            {
              "id": 513332,
              "pid": 5133,
              "level": "district",
              "name": "石渠县"
            },
            {
              "id": 513333,
              "pid": 5133,
              "level": "district",
              "name": "色达县"
            },
            {
              "id": 513334,
              "pid": 5133,
              "level": "district",
              "name": "理塘县"
            },
            {
              "id": 513335,
              "pid": 5133,
              "level": "district",
              "name": "巴塘县"
            },
            {
              "id": 513336,
              "pid": 5133,
              "level": "district",
              "name": "乡城县"
            },
            {
              "id": 513337,
              "pid": 5133,
              "level": "district",
              "name": "稻城县"
            },
            {
              "id": 513338,
              "pid": 5133,
              "level": "district",
              "name": "得荣县"
            }
          ]
        },
        {
          "id": 5134,
          "pid": 51,
          "level": "city",
          "name": "凉山彝族自治州",
          "children": [
            {
              "id": 513401,
              "pid": 5134,
              "level": "district",
              "name": "西昌市"
            },
            {
              "id": 513402,
              "pid": 5134,
              "level": "district",
              "name": "会理市"
            },
            {
              "id": 513422,
              "pid": 5134,
              "level": "district",
              "name": "木里藏族自治县"
            },
            {
              "id": 513423,
              "pid": 5134,
              "level": "district",
              "name": "盐源县"
            },
            {
              "id": 513424,
              "pid": 5134,
              "level": "district",
              "name": "德昌县"
            },
            {
              "id": 513426,
              "pid": 5134,
              "level": "district",
              "name": "会东县"
            },
            {
              "id": 513427,
              "pid": 5134,
              "level": "district",
              "name": "宁南县"
            },
            {
              "id": 513428,
              "pid": 5134,
              "level": "district",
              "name": "普格县"
            },
            {
              "id": 513429,
              "pid": 5134,
              "level": "district",
              "name": "布拖县"
            },
            {
              "id": 513430,
              "pid": 5134,
              "level": "district",
              "name": "金阳县"
            },
            {
              "id": 513431,
              "pid": 5134,
              "level": "district",
              "name": "昭觉县"
            },
            {
              "id": 513432,
              "pid": 5134,
              "level": "district",
              "name": "喜德县"
            },
            {
              "id": 513433,
              "pid": 5134,
              "level": "district",
              "name": "冕宁县"
            },
            {
              "id": 513434,
              "pid": 5134,
              "level": "district",
              "name": "越西县"
            },
            {
              "id": 513435,
              "pid": 5134,
              "level": "district",
              "name": "甘洛县"
            },
            {
              "id": 513436,
              "pid": 5134,
              "level": "district",
              "name": "美姑县"
            },
            {
              "id": 513437,
              "pid": 5134,
              "level": "district",
              "name": "雷波县"
            }
          ]
        }
      ]
    },
    {
      "id": 52,
      "pid": 0,
      "level": "province",
      "name": "贵州省",
      "children": [
        {
          "id": 5201,
          "pid": 52,
          "level": "city",
          "name": "贵阳市",
          "children": [
            {
              "id": 520102,
              "pid": 5201,
              "level": "district",
              "name": "南明区"
            },
            {
              "id": 520103,
              "pid": 5201,
              "level": "district",
              "name": "云岩区"
            },
            {
              "id": 520111,
              "pid": 5201,
              "level": "district",
              "name": "花溪区"
            },
            {
              "id": 520112,
              "pid": 5201,
              "level": "district",
              "name": "乌当区"
            },
            {
              "id": 520113,
              "pid": 5201,
              "level": "district",
              "name": "白云区"
            },
            {
              "id": 520115,
              "pid": 5201,
              "level": "district",
              "name": "观山湖区"
            },
            {
              "id": 520121,
              "pid": 5201,
              "level": "district",
              "name": "开阳县"
            },
            {
              "id": 520122,
              "pid": 5201,
              "level": "district",
              "name": "息烽县"
            },
            {
              "id": 520123,
              "pid": 5201,
              "level": "district",
              "name": "修文县"
            },
            {
              "id": 520181,
              "pid": 5201,
              "level": "district",
              "name": "清镇市"
            }
          ]
        },
        {
          "id": 5202,
          "pid": 52,
          "level": "city",
          "name": "六盘水市",
          "children": [
            {
              "id": 520201,
              "pid": 5202,
              "level": "district",
              "name": "钟山区"
            },
            {
              "id": 520203,
              "pid": 5202,
              "level": "district",
              "name": "六枝特区"
            },
            {
              "id": 520204,
              "pid": 5202,
              "level": "district",
              "name": "水城区"
            },
            {
              "id": 520281,
              "pid": 5202,
              "level": "district",
              "name": "盘州市"
            }
          ]
        },
        {
          "id": 5203,
          "pid": 52,
          "level": "city",
          "name": "遵义市",
          "children": [
            {
              "id": 520302,
              "pid": 5203,
              "level": "district",
              "name": "红花岗区"
            },
            {
              "id": 520303,
              "pid": 5203,
              "level": "district",
              "name": "汇川区"
            },
            {
              "id": 520304,
              "pid": 5203,
              "level": "district",
              "name": "播州区"
            },
            {
              "id": 520322,
              "pid": 5203,
              "level": "district",
              "name": "桐梓县"
            },
            {
              "id": 520323,
              "pid": 5203,
              "level": "district",
              "name": "绥阳县"
            },
            {
              "id": 520324,
              "pid": 5203,
              "level": "district",
              "name": "正安县"
            },
            {
              "id": 520325,
              "pid": 5203,
              "level": "district",
              "name": "道真仡佬族苗族自治县"
            },
            {
              "id": 520326,
              "pid": 5203,
              "level": "district",
              "name": "务川仡佬族苗族自治县"
            },
            {
              "id": 520327,
              "pid": 5203,
              "level": "district",
              "name": "凤冈县"
            },
            {
              "id": 520328,
              "pid": 5203,
              "level": "district",
              "name": "湄潭县"
            },
            {
              "id": 520329,
              "pid": 5203,
              "level": "district",
              "name": "余庆县"
            },
            {
              "id": 520330,
              "pid": 5203,
              "level": "district",
              "name": "习水县"
            },
            {
              "id": 520381,
              "pid": 5203,
              "level": "district",
              "name": "赤水市"
            },
            {
              "id": 520382,
              "pid": 5203,
              "level": "district",
              "name": "仁怀市"
            }
          ]
        },
        {
          "id": 5204,
          "pid": 52,
          "level": "city",
          "name": "安顺市",
          "children": [
            {
              "id": 520402,
              "pid": 5204,
              "level": "district",
              "name": "西秀区"
            },
            {
              "id": 520403,
              "pid": 5204,
              "level": "district",
              "name": "平坝区"
            },
            {
              "id": 520422,
              "pid": 5204,
              "level": "district",
              "name": "普定县"
            },
            {
              "id": 520423,
              "pid": 5204,
              "level": "district",
              "name": "镇宁布依族苗族自治县"
            },
            {
              "id": 520424,
              "pid": 5204,
              "level": "district",
              "name": "关岭布依族苗族自治县"
            },
            {
              "id": 520425,
              "pid": 5204,
              "level": "district",
              "name": "紫云苗族布依族自治县"
            }
          ]
        },
        {
          "id": 5205,
          "pid": 52,
          "level": "city",
          "name": "毕节市",
          "children": [
            {
              "id": 520502,
              "pid": 5205,
              "level": "district",
              "name": "七星关区"
            },
            {
              "id": 520521,
              "pid": 5205,
              "level": "district",
              "name": "大方县"
            },
            {
              "id": 520523,
              "pid": 5205,
              "level": "district",
              "name": "金沙县"
            },
            {
              "id": 520524,
              "pid": 5205,
              "level": "district",
              "name": "织金县"
            },
            {
              "id": 520525,
              "pid": 5205,
              "level": "district",
              "name": "纳雍县"
            },
            {
              "id": 520526,
              "pid": 5205,
              "level": "district",
              "name": "威宁彝族回族苗族自治县"
            },
            {
              "id": 520527,
              "pid": 5205,
              "level": "district",
              "name": "赫章县"
            },
            {
              "id": 520581,
              "pid": 5205,
              "level": "district",
              "name": "黔西市"
            }
          ]
        },
        {
          "id": 5206,
          "pid": 52,
          "level": "city",
          "name": "铜仁市",
          "children": [
            {
              "id": 520602,
              "pid": 5206,
              "level": "district",
              "name": "碧江区"
            },
            {
              "id": 520603,
              "pid": 5206,
              "level": "district",
              "name": "万山区"
            },
            {
              "id": 520621,
              "pid": 5206,
              "level": "district",
              "name": "江口县"
            },
            {
              "id": 520622,
              "pid": 5206,
              "level": "district",
              "name": "玉屏侗族自治县"
            },
            {
              "id": 520623,
              "pid": 5206,
              "level": "district",
              "name": "石阡县"
            },
            {
              "id": 520624,
              "pid": 5206,
              "level": "district",
              "name": "思南县"
            },
            {
              "id": 520625,
              "pid": 5206,
              "level": "district",
              "name": "印江土家族苗族自治县"
            },
            {
              "id": 520626,
              "pid": 5206,
              "level": "district",
              "name": "德江县"
            },
            {
              "id": 520627,
              "pid": 5206,
              "level": "district",
              "name": "沿河土家族自治县"
            },
            {
              "id": 520628,
              "pid": 5206,
              "level": "district",
              "name": "松桃苗族自治县"
            }
          ]
        },
        {
          "id": 5223,
          "pid": 52,
          "level": "city",
          "name": "黔西南布依族苗族自治州",
          "children": [
            {
              "id": 522301,
              "pid": 5223,
              "level": "district",
              "name": "兴义市"
            },
            {
              "id": 522302,
              "pid": 5223,
              "level": "district",
              "name": "兴仁市"
            },
            {
              "id": 522323,
              "pid": 5223,
              "level": "district",
              "name": "普安县"
            },
            {
              "id": 522324,
              "pid": 5223,
              "level": "district",
              "name": "晴隆县"
            },
            {
              "id": 522325,
              "pid": 5223,
              "level": "district",
              "name": "贞丰县"
            },
            {
              "id": 522326,
              "pid": 5223,
              "level": "district",
              "name": "望谟县"
            },
            {
              "id": 522327,
              "pid": 5223,
              "level": "district",
              "name": "册亨县"
            },
            {
              "id": 522328,
              "pid": 5223,
              "level": "district",
              "name": "安龙县"
            }
          ]
        },
        {
          "id": 5226,
          "pid": 52,
          "level": "city",
          "name": "黔东南苗族侗族自治州",
          "children": [
            {
              "id": 522601,
              "pid": 5226,
              "level": "district",
              "name": "凯里市"
            },
            {
              "id": 522622,
              "pid": 5226,
              "level": "district",
              "name": "黄平县"
            },
            {
              "id": 522623,
              "pid": 5226,
              "level": "district",
              "name": "施秉县"
            },
            {
              "id": 522624,
              "pid": 5226,
              "level": "district",
              "name": "三穗县"
            },
            {
              "id": 522625,
              "pid": 5226,
              "level": "district",
              "name": "镇远县"
            },
            {
              "id": 522626,
              "pid": 5226,
              "level": "district",
              "name": "岑巩县"
            },
            {
              "id": 522627,
              "pid": 5226,
              "level": "district",
              "name": "天柱县"
            },
            {
              "id": 522628,
              "pid": 5226,
              "level": "district",
              "name": "锦屏县"
            },
            {
              "id": 522629,
              "pid": 5226,
              "level": "district",
              "name": "剑河县"
            },
            {
              "id": 522630,
              "pid": 5226,
              "level": "district",
              "name": "台江县"
            },
            {
              "id": 522631,
              "pid": 5226,
              "level": "district",
              "name": "黎平县"
            },
            {
              "id": 522632,
              "pid": 5226,
              "level": "district",
              "name": "榕江县"
            },
            {
              "id": 522633,
              "pid": 5226,
              "level": "district",
              "name": "从江县"
            },
            {
              "id": 522634,
              "pid": 5226,
              "level": "district",
              "name": "雷山县"
            },
            {
              "id": 522635,
              "pid": 5226,
              "level": "district",
              "name": "麻江县"
            },
            {
              "id": 522636,
              "pid": 5226,
              "level": "district",
              "name": "丹寨县"
            }
          ]
        },
        {
          "id": 5227,
          "pid": 52,
          "level": "city",
          "name": "黔南布依族苗族自治州",
          "children": [
            {
              "id": 522701,
              "pid": 5227,
              "level": "district",
              "name": "都匀市"
            },
            {
              "id": 522702,
              "pid": 5227,
              "level": "district",
              "name": "福泉市"
            },
            {
              "id": 522722,
              "pid": 5227,
              "level": "district",
              "name": "荔波县"
            },
            {
              "id": 522723,
              "pid": 5227,
              "level": "district",
              "name": "贵定县"
            },
            {
              "id": 522725,
              "pid": 5227,
              "level": "district",
              "name": "瓮安县"
            },
            {
              "id": 522726,
              "pid": 5227,
              "level": "district",
              "name": "独山县"
            },
            {
              "id": 522727,
              "pid": 5227,
              "level": "district",
              "name": "平塘县"
            },
            {
              "id": 522728,
              "pid": 5227,
              "level": "district",
              "name": "罗甸县"
            },
            {
              "id": 522729,
              "pid": 5227,
              "level": "district",
              "name": "长顺县"
            },
            {
              "id": 522730,
              "pid": 5227,
              "level": "district",
              "name": "龙里县"
            },
            {
              "id": 522731,
              "pid": 5227,
              "level": "district",
              "name": "惠水县"
            },
            {
              "id": 522732,
              "pid": 5227,
              "level": "district",
              "name": "三都水族自治县"
            }
          ]
        }
      ]
    },
    {
      "id": 53,
      "pid": 0,
      "level": "province",
      "name": "云南省",
      "children": [
        {
          "id": 5301,
          "pid": 53,
          "level": "city",
          "name": "昆明市",
          "children": [
            {
              "id": 530102,
              "pid": 5301,
              "level": "district",
              "name": "五华区"
            },
            {
              "id": 530103,
              "pid": 5301,
              "level": "district",
              "name": "盘龙区"
            },
            {
              "id": 530111,
              "pid": 5301,
              "level": "district",
              "name": "官渡区"
            },
            {
              "id": 530112,
              "pid": 5301,
              "level": "district",
              "name": "西山区"
            },
            {
              "id": 530113,
              "pid": 5301,
              "level": "district",
              "name": "东川区"
            },
            {
              "id": 530114,
              "pid": 5301,
              "level": "district",
              "name": "呈贡区"
            },
            {
              "id": 530115,
              "pid": 5301,
              "level": "district",
              "name": "晋宁区"
            },
            {
              "id": 530124,
              "pid": 5301,
              "level": "district",
              "name": "富民县"
            },
            {
              "id": 530125,
              "pid": 5301,
              "level": "district",
              "name": "宜良县"
            },
            {
              "id": 530126,
              "pid": 5301,
              "level": "district",
              "name": "石林彝族自治县"
            },
            {
              "id": 530127,
              "pid": 5301,
              "level": "district",
              "name": "嵩明县"
            },
            {
              "id": 530128,
              "pid": 5301,
              "level": "district",
              "name": "禄劝彝族苗族自治县"
            },
            {
              "id": 530129,
              "pid": 5301,
              "level": "district",
              "name": "寻甸回族彝族自治县"
            },
            {
              "id": 530181,
              "pid": 5301,
              "level": "district",
              "name": "安宁市"
            }
          ]
        },
        {
          "id": 5303,
          "pid": 53,
          "level": "city",
          "name": "曲靖市",
          "children": [
            {
              "id": 530302,
              "pid": 5303,
              "level": "district",
              "name": "麒麟区"
            },
            {
              "id": 530303,
              "pid": 5303,
              "level": "district",
              "name": "沾益区"
            },
            {
              "id": 530304,
              "pid": 5303,
              "level": "district",
              "name": "马龙区"
            },
            {
              "id": 530322,
              "pid": 5303,
              "level": "district",
              "name": "陆良县"
            },
            {
              "id": 530323,
              "pid": 5303,
              "level": "district",
              "name": "师宗县"
            },
            {
              "id": 530324,
              "pid": 5303,
              "level": "district",
              "name": "罗平县"
            },
            {
              "id": 530325,
              "pid": 5303,
              "level": "district",
              "name": "富源县"
            },
            {
              "id": 530326,
              "pid": 5303,
              "level": "district",
              "name": "会泽县"
            },
            {
              "id": 530381,
              "pid": 5303,
              "level": "district",
              "name": "宣威市"
            }
          ]
        },
        {
          "id": 5304,
          "pid": 53,
          "level": "city",
          "name": "玉溪市",
          "children": [
            {
              "id": 530402,
              "pid": 5304,
              "level": "district",
              "name": "红塔区"
            },
            {
              "id": 530403,
              "pid": 5304,
              "level": "district",
              "name": "江川区"
            },
            {
              "id": 530423,
              "pid": 5304,
              "level": "district",
              "name": "通海县"
            },
            {
              "id": 530424,
              "pid": 5304,
              "level": "district",
              "name": "华宁县"
            },
            {
              "id": 530425,
              "pid": 5304,
              "level": "district",
              "name": "易门县"
            },
            {
              "id": 530426,
              "pid": 5304,
              "level": "district",
              "name": "峨山彝族自治县"
            },
            {
              "id": 530427,
              "pid": 5304,
              "level": "district",
              "name": "新平彝族傣族自治县"
            },
            {
              "id": 530428,
              "pid": 5304,
              "level": "district",
              "name": "元江哈尼族彝族傣族自治县"
            },
            {
              "id": 530481,
              "pid": 5304,
              "level": "district",
              "name": "澄江市"
            }
          ]
        },
        {
          "id": 5305,
          "pid": 53,
          "level": "city",
          "name": "保山市",
          "children": [
            {
              "id": 530502,
              "pid": 5305,
              "level": "district",
              "name": "隆阳区"
            },
            {
              "id": 530521,
              "pid": 5305,
              "level": "district",
              "name": "施甸县"
            },
            {
              "id": 530523,
              "pid": 5305,
              "level": "district",
              "name": "龙陵县"
            },
            {
              "id": 530524,
              "pid": 5305,
              "level": "district",
              "name": "昌宁县"
            },
            {
              "id": 530581,
              "pid": 5305,
              "level": "district",
              "name": "腾冲市"
            }
          ]
        },
        {
          "id": 5306,
          "pid": 53,
          "level": "city",
          "name": "昭通市",
          "children": [
            {
              "id": 530602,
              "pid": 5306,
              "level": "district",
              "name": "昭阳区"
            },
            {
              "id": 530621,
              "pid": 5306,
              "level": "district",
              "name": "鲁甸县"
            },
            {
              "id": 530622,
              "pid": 5306,
              "level": "district",
              "name": "巧家县"
            },
            {
              "id": 530623,
              "pid": 5306,
              "level": "district",
              "name": "盐津县"
            },
            {
              "id": 530624,
              "pid": 5306,
              "level": "district",
              "name": "大关县"
            },
            {
              "id": 530625,
              "pid": 5306,
              "level": "district",
              "name": "永善县"
            },
            {
              "id": 530626,
              "pid": 5306,
              "level": "district",
              "name": "绥江县"
            },
            {
              "id": 530627,
              "pid": 5306,
              "level": "district",
              "name": "镇雄县"
            },
            {
              "id": 530628,
              "pid": 5306,
              "level": "district",
              "name": "彝良县"
            },
            {
              "id": 530629,
              "pid": 5306,
              "level": "district",
              "name": "威信县"
            },
            {
              "id": 530681,
              "pid": 5306,
              "level": "district",
              "name": "水富市"
            }
          ]
        },
        {
          "id": 5307,
          "pid": 53,
          "level": "city",
          "name": "丽江市",
          "children": [
            {
              "id": 530702,
              "pid": 5307,
              "level": "district",
              "name": "古城区"
            },
            {
              "id": 530721,
              "pid": 5307,
              "level": "district",
              "name": "玉龙纳西族自治县"
            },
            {
              "id": 530722,
              "pid": 5307,
              "level": "district",
              "name": "永胜县"
            },
            {
              "id": 530723,
              "pid": 5307,
              "level": "district",
              "name": "华坪县"
            },
            {
              "id": 530724,
              "pid": 5307,
              "level": "district",
              "name": "宁蒗彝族自治县"
            }
          ]
        },
        {
          "id": 5308,
          "pid": 53,
          "level": "city",
          "name": "普洱市",
          "children": [
            {
              "id": 530802,
              "pid": 5308,
              "level": "district",
              "name": "思茅区"
            },
            {
              "id": 530821,
              "pid": 5308,
              "level": "district",
              "name": "宁洱哈尼族彝族自治县"
            },
            {
              "id": 530822,
              "pid": 5308,
              "level": "district",
              "name": "墨江哈尼族自治县"
            },
            {
              "id": 530823,
              "pid": 5308,
              "level": "district",
              "name": "景东彝族自治县"
            },
            {
              "id": 530824,
              "pid": 5308,
              "level": "district",
              "name": "景谷傣族彝族自治县"
            },
            {
              "id": 530825,
              "pid": 5308,
              "level": "district",
              "name": "镇沅彝族哈尼族拉祜族自治县"
            },
            {
              "id": 530826,
              "pid": 5308,
              "level": "district",
              "name": "江城哈尼族彝族自治县"
            },
            {
              "id": 530827,
              "pid": 5308,
              "level": "district",
              "name": "孟连傣族拉祜族佤族自治县"
            },
            {
              "id": 530828,
              "pid": 5308,
              "level": "district",
              "name": "澜沧拉祜族自治县"
            },
            {
              "id": 530829,
              "pid": 5308,
              "level": "district",
              "name": "西盟佤族自治县"
            }
          ]
        },
        {
          "id": 5309,
          "pid": 53,
          "level": "city",
          "name": "临沧市",
          "children": [
            {
              "id": 530902,
              "pid": 5309,
              "level": "district",
              "name": "临翔区"
            },
            {
              "id": 530921,
              "pid": 5309,
              "level": "district",
              "name": "凤庆县"
            },
            {
              "id": 530922,
              "pid": 5309,
              "level": "district",
              "name": "云县"
            },
            {
              "id": 530923,
              "pid": 5309,
              "level": "district",
              "name": "永德县"
            },
            {
              "id": 530924,
              "pid": 5309,
              "level": "district",
              "name": "镇康县"
            },
            {
              "id": 530925,
              "pid": 5309,
              "level": "district",
              "name": "双江拉祜族佤族布朗族傣族自治县"
            },
            {
              "id": 530926,
              "pid": 5309,
              "level": "district",
              "name": "耿马傣族佤族自治县"
            },
            {
              "id": 530927,
              "pid": 5309,
              "level": "district",
              "name": "沧源佤族自治县"
            }
          ]
        },
        {
          "id": 5323,
          "pid": 53,
          "level": "city",
          "name": "楚雄彝族自治州",
          "children": [
            {
              "id": 532301,
              "pid": 5323,
              "level": "district",
              "name": "楚雄市"
            },
            {
              "id": 532302,
              "pid": 5323,
              "level": "district",
              "name": "禄丰市"
            },
            {
              "id": 532322,
              "pid": 5323,
              "level": "district",
              "name": "双柏县"
            },
            {
              "id": 532323,
              "pid": 5323,
              "level": "district",
              "name": "牟定县"
            },
            {
              "id": 532324,
              "pid": 5323,
              "level": "district",
              "name": "南华县"
            },
            {
              "id": 532325,
              "pid": 5323,
              "level": "district",
              "name": "姚安县"
            },
            {
              "id": 532326,
              "pid": 5323,
              "level": "district",
              "name": "大姚县"
            },
            {
              "id": 532327,
              "pid": 5323,
              "level": "district",
              "name": "永仁县"
            },
            {
              "id": 532328,
              "pid": 5323,
              "level": "district",
              "name": "元谋县"
            },
            {
              "id": 532329,
              "pid": 5323,
              "level": "district",
              "name": "武定县"
            }
          ]
        },
        {
          "id": 5325,
          "pid": 53,
          "level": "city",
          "name": "红河哈尼族彝族自治州",
          "children": [
            {
              "id": 532501,
              "pid": 5325,
              "level": "district",
              "name": "个旧市"
            },
            {
              "id": 532502,
              "pid": 5325,
              "level": "district",
              "name": "开远市"
            },
            {
              "id": 532503,
              "pid": 5325,
              "level": "district",
              "name": "蒙自市"
            },
            {
              "id": 532504,
              "pid": 5325,
              "level": "district",
              "name": "弥勒市"
            },
            {
              "id": 532523,
              "pid": 5325,
              "level": "district",
              "name": "屏边苗族自治县"
            },
            {
              "id": 532524,
              "pid": 5325,
              "level": "district",
              "name": "建水县"
            },
            {
              "id": 532525,
              "pid": 5325,
              "level": "district",
              "name": "石屏县"
            },
            {
              "id": 532527,
              "pid": 5325,
              "level": "district",
              "name": "泸西县"
            },
            {
              "id": 532528,
              "pid": 5325,
              "level": "district",
              "name": "元阳县"
            },
            {
              "id": 532529,
              "pid": 5325,
              "level": "district",
              "name": "红河县"
            },
            {
              "id": 532530,
              "pid": 5325,
              "level": "district",
              "name": "金平苗族瑶族傣族自治县"
            },
            {
              "id": 532531,
              "pid": 5325,
              "level": "district",
              "name": "绿春县"
            },
            {
              "id": 532532,
              "pid": 5325,
              "level": "district",
              "name": "河口瑶族自治县"
            }
          ]
        },
        {
          "id": 5326,
          "pid": 53,
          "level": "city",
          "name": "文山壮族苗族自治州",
          "children": [
            {
              "id": 532601,
              "pid": 5326,
              "level": "district",
              "name": "文山市"
            },
            {
              "id": 532622,
              "pid": 5326,
              "level": "district",
              "name": "砚山县"
            },
            {
              "id": 532623,
              "pid": 5326,
              "level": "district",
              "name": "西畴县"
            },
            {
              "id": 532624,
              "pid": 5326,
              "level": "district",
              "name": "麻栗坡县"
            },
            {
              "id": 532625,
              "pid": 5326,
              "level": "district",
              "name": "马关县"
            },
            {
              "id": 532626,
              "pid": 5326,
              "level": "district",
              "name": "丘北县"
            },
            {
              "id": 532627,
              "pid": 5326,
              "level": "district",
              "name": "广南县"
            },
            {
              "id": 532628,
              "pid": 5326,
              "level": "district",
              "name": "富宁县"
            }
          ]
        },
        {
          "id": 5328,
          "pid": 53,
          "level": "city",
          "name": "西双版纳傣族自治州",
          "children": [
            {
              "id": 532801,
              "pid": 5328,
              "level": "district",
              "name": "景洪市"
            },
            {
              "id": 532822,
              "pid": 5328,
              "level": "district",
              "name": "勐海县"
            },
            {
              "id": 532823,
              "pid": 5328,
              "level": "district",
              "name": "勐腊县"
            }
          ]
        },
        {
          "id": 5329,
          "pid": 53,
          "level": "city",
          "name": "大理白族自治州",
          "children": [
            {
              "id": 532901,
              "pid": 5329,
              "level": "district",
              "name": "大理市"
            },
            {
              "id": 532922,
              "pid": 5329,
              "level": "district",
              "name": "漾濞彝族自治县"
            },
            {
              "id": 532923,
              "pid": 5329,
              "level": "district",
              "name": "祥云县"
            },
            {
              "id": 532924,
              "pid": 5329,
              "level": "district",
              "name": "宾川县"
            },
            {
              "id": 532925,
              "pid": 5329,
              "level": "district",
              "name": "弥渡县"
            },
            {
              "id": 532926,
              "pid": 5329,
              "level": "district",
              "name": "南涧彝族自治县"
            },
            {
              "id": 532927,
              "pid": 5329,
              "level": "district",
              "name": "巍山彝族回族自治县"
            },
            {
              "id": 532928,
              "pid": 5329,
              "level": "district",
              "name": "永平县"
            },
            {
              "id": 532929,
              "pid": 5329,
              "level": "district",
              "name": "云龙县"
            },
            {
              "id": 532930,
              "pid": 5329,
              "level": "district",
              "name": "洱源县"
            },
            {
              "id": 532931,
              "pid": 5329,
              "level": "district",
              "name": "剑川县"
            },
            {
              "id": 532932,
              "pid": 5329,
              "level": "district",
              "name": "鹤庆县"
            }
          ]
        },
        {
          "id": 5331,
          "pid": 53,
          "level": "city",
          "name": "德宏傣族景颇族自治州",
          "children": [
            {
              "id": 533102,
              "pid": 5331,
              "level": "district",
              "name": "瑞丽市"
            },
            {
              "id": 533103,
              "pid": 5331,
              "level": "district",
              "name": "芒市"
            },
            {
              "id": 533122,
              "pid": 5331,
              "level": "district",
              "name": "梁河县"
            },
            {
              "id": 533123,
              "pid": 5331,
              "level": "district",
              "name": "盈江县"
            },
            {
              "id": 533124,
              "pid": 5331,
              "level": "district",
              "name": "陇川县"
            }
          ]
        },
        {
          "id": 5333,
          "pid": 53,
          "level": "city",
          "name": "怒江傈僳族自治州",
          "children": [
            {
              "id": 533301,
              "pid": 5333,
              "level": "district",
              "name": "泸水市"
            },
            {
              "id": 533323,
              "pid": 5333,
              "level": "district",
              "name": "福贡县"
            },
            {
              "id": 533324,
              "pid": 5333,
              "level": "district",
              "name": "贡山独龙族怒族自治县"
            },
            {
              "id": 533325,
              "pid": 5333,
              "level": "district",
              "name": "兰坪白族普米族自治县"
            }
          ]
        },
        {
          "id": 5334,
          "pid": 53,
          "level": "city",
          "name": "迪庆藏族自治州",
          "children": [
            {
              "id": 533401,
              "pid": 5334,
              "level": "district",
              "name": "香格里拉市"
            },
            {
              "id": 533422,
              "pid": 5334,
              "level": "district",
              "name": "德钦县"
            },
            {
              "id": 533423,
              "pid": 5334,
              "level": "district",
              "name": "维西傈僳族自治县"
            }
          ]
        }
      ]
    },
    {
      "id": 54,
      "pid": 0,
      "level": "province",
      "name": "西藏自治区",
      "children": [
        {
          "id": 5401,
          "pid": 54,
          "level": "city",
          "name": "拉萨市",
          "children": [
            {
              "id": 540102,
              "pid": 5401,
              "level": "district",
              "name": "城关区"
            },
            {
              "id": 540103,
              "pid": 5401,
              "level": "district",
              "name": "堆龙德庆区"
            },
            {
              "id": 540104,
              "pid": 5401,
              "level": "district",
              "name": "达孜区"
            },
            {
              "id": 540121,
              "pid": 5401,
              "level": "district",
              "name": "林周县"
            },
            {
              "id": 540122,
              "pid": 5401,
              "level": "district",
              "name": "当雄县"
            },
            {
              "id": 540123,
              "pid": 5401,
              "level": "district",
              "name": "尼木县"
            },
            {
              "id": 540124,
              "pid": 5401,
              "level": "district",
              "name": "曲水县"
            },
            {
              "id": 540127,
              "pid": 5401,
              "level": "district",
              "name": "墨竹工卡县"
            },
            {
              "id": 540171,
              "pid": 5401,
              "level": "district",
              "name": "格尔木藏青工业园区"
            },
            {
              "id": 540172,
              "pid": 5401,
              "level": "district",
              "name": "拉萨经济技术开发区"
            },
            {
              "id": 540173,
              "pid": 5401,
              "level": "district",
              "name": "西藏文化旅游创意园区"
            },
            {
              "id": 540174,
              "pid": 5401,
              "level": "district",
              "name": "达孜工业园区"
            }
          ]
        },
        {
          "id": 5402,
          "pid": 54,
          "level": "city",
          "name": "日喀则市",
          "children": [
            {
              "id": 540202,
              "pid": 5402,
              "level": "district",
              "name": "桑珠孜区"
            },
            {
              "id": 540221,
              "pid": 5402,
              "level": "district",
              "name": "南木林县"
            },
            {
              "id": 540222,
              "pid": 5402,
              "level": "district",
              "name": "江孜县"
            },
            {
              "id": 540223,
              "pid": 5402,
              "level": "district",
              "name": "定日县"
            },
            {
              "id": 540224,
              "pid": 5402,
              "level": "district",
              "name": "萨迦县"
            },
            {
              "id": 540225,
              "pid": 5402,
              "level": "district",
              "name": "拉孜县"
            },
            {
              "id": 540226,
              "pid": 5402,
              "level": "district",
              "name": "昂仁县"
            },
            {
              "id": 540227,
              "pid": 5402,
              "level": "district",
              "name": "谢通门县"
            },
            {
              "id": 540228,
              "pid": 5402,
              "level": "district",
              "name": "白朗县"
            },
            {
              "id": 540229,
              "pid": 5402,
              "level": "district",
              "name": "仁布县"
            },
            {
              "id": 540230,
              "pid": 5402,
              "level": "district",
              "name": "康马县"
            },
            {
              "id": 540231,
              "pid": 5402,
              "level": "district",
              "name": "定结县"
            },
            {
              "id": 540232,
              "pid": 5402,
              "level": "district",
              "name": "仲巴县"
            },
            {
              "id": 540233,
              "pid": 5402,
              "level": "district",
              "name": "亚东县"
            },
            {
              "id": 540234,
              "pid": 5402,
              "level": "district",
              "name": "吉隆县"
            },
            {
              "id": 540235,
              "pid": 5402,
              "level": "district",
              "name": "聂拉木县"
            },
            {
              "id": 540236,
              "pid": 5402,
              "level": "district",
              "name": "萨嘎县"
            },
            {
              "id": 540237,
              "pid": 5402,
              "level": "district",
              "name": "岗巴县"
            }
          ]
        },
        {
          "id": 5403,
          "pid": 54,
          "level": "city",
          "name": "昌都市",
          "children": [
            {
              "id": 540302,
              "pid": 5403,
              "level": "district",
              "name": "卡若区"
            },
            {
              "id": 540321,
              "pid": 5403,
              "level": "district",
              "name": "江达县"
            },
            {
              "id": 540322,
              "pid": 5403,
              "level": "district",
              "name": "贡觉县"
            },
            {
              "id": 540323,
              "pid": 5403,
              "level": "district",
              "name": "类乌齐县"
            },
            {
              "id": 540324,
              "pid": 5403,
              "level": "district",
              "name": "丁青县"
            },
            {
              "id": 540325,
              "pid": 5403,
              "level": "district",
              "name": "察雅县"
            },
            {
              "id": 540326,
              "pid": 5403,
              "level": "district",
              "name": "八宿县"
            },
            {
              "id": 540327,
              "pid": 5403,
              "level": "district",
              "name": "左贡县"
            },
            {
              "id": 540328,
              "pid": 5403,
              "level": "district",
              "name": "芒康县"
            },
            {
              "id": 540329,
              "pid": 5403,
              "level": "district",
              "name": "洛隆县"
            },
            {
              "id": 540330,
              "pid": 5403,
              "level": "district",
              "name": "边坝县"
            }
          ]
        },
        {
          "id": 5404,
          "pid": 54,
          "level": "city",
          "name": "林芝市",
          "children": [
            {
              "id": 540402,
              "pid": 5404,
              "level": "district",
              "name": "巴宜区"
            },
            {
              "id": 540421,
              "pid": 5404,
              "level": "district",
              "name": "工布江达县"
            },
            {
              "id": 540422,
              "pid": 5404,
              "level": "district",
              "name": "米林县"
            },
            {
              "id": 540423,
              "pid": 5404,
              "level": "district",
              "name": "墨脱县"
            },
            {
              "id": 540424,
              "pid": 5404,
              "level": "district",
              "name": "波密县"
            },
            {
              "id": 540425,
              "pid": 5404,
              "level": "district",
              "name": "察隅县"
            },
            {
              "id": 540426,
              "pid": 5404,
              "level": "district",
              "name": "朗县"
            }
          ]
        },
        {
          "id": 5405,
          "pid": 54,
          "level": "city",
          "name": "山南市",
          "children": [
            {
              "id": 540502,
              "pid": 5405,
              "level": "district",
              "name": "乃东区"
            },
            {
              "id": 540521,
              "pid": 5405,
              "level": "district",
              "name": "扎囊县"
            },
            {
              "id": 540522,
              "pid": 5405,
              "level": "district",
              "name": "贡嘎县"
            },
            {
              "id": 540523,
              "pid": 5405,
              "level": "district",
              "name": "桑日县"
            },
            {
              "id": 540524,
              "pid": 5405,
              "level": "district",
              "name": "琼结县"
            },
            {
              "id": 540525,
              "pid": 5405,
              "level": "district",
              "name": "曲松县"
            },
            {
              "id": 540526,
              "pid": 5405,
              "level": "district",
              "name": "措美县"
            },
            {
              "id": 540527,
              "pid": 5405,
              "level": "district",
              "name": "洛扎县"
            },
            {
              "id": 540528,
              "pid": 5405,
              "level": "district",
              "name": "加查县"
            },
            {
              "id": 540529,
              "pid": 5405,
              "level": "district",
              "name": "隆子县"
            },
            {
              "id": 540530,
              "pid": 5405,
              "level": "district",
              "name": "错那县"
            },
            {
              "id": 540531,
              "pid": 5405,
              "level": "district",
              "name": "浪卡子县"
            }
          ]
        },
        {
          "id": 5406,
          "pid": 54,
          "level": "city",
          "name": "那曲市",
          "children": [
            {
              "id": 540602,
              "pid": 5406,
              "level": "district",
              "name": "色尼区"
            },
            {
              "id": 540621,
              "pid": 5406,
              "level": "district",
              "name": "嘉黎县"
            },
            {
              "id": 540622,
              "pid": 5406,
              "level": "district",
              "name": "比如县"
            },
            {
              "id": 540623,
              "pid": 5406,
              "level": "district",
              "name": "聂荣县"
            },
            {
              "id": 540624,
              "pid": 5406,
              "level": "district",
              "name": "安多县"
            },
            {
              "id": 540625,
              "pid": 5406,
              "level": "district",
              "name": "申扎县"
            },
            {
              "id": 540626,
              "pid": 5406,
              "level": "district",
              "name": "索县"
            },
            {
              "id": 540627,
              "pid": 5406,
              "level": "district",
              "name": "班戈县"
            },
            {
              "id": 540628,
              "pid": 5406,
              "level": "district",
              "name": "巴青县"
            },
            {
              "id": 540629,
              "pid": 5406,
              "level": "district",
              "name": "尼玛县"
            },
            {
              "id": 540630,
              "pid": 5406,
              "level": "district",
              "name": "双湖县"
            }
          ]
        },
        {
          "id": 5425,
          "pid": 54,
          "level": "city",
          "name": "阿里地区",
          "children": [
            {
              "id": 542521,
              "pid": 5425,
              "level": "district",
              "name": "普兰县"
            },
            {
              "id": 542522,
              "pid": 5425,
              "level": "district",
              "name": "札达县"
            },
            {
              "id": 542523,
              "pid": 5425,
              "level": "district",
              "name": "噶尔县"
            },
            {
              "id": 542524,
              "pid": 5425,
              "level": "district",
              "name": "日土县"
            },
            {
              "id": 542525,
              "pid": 5425,
              "level": "district",
              "name": "革吉县"
            },
            {
              "id": 542526,
              "pid": 5425,
              "level": "district",
              "name": "改则县"
            },
            {
              "id": 542527,
              "pid": 5425,
              "level": "district",
              "name": "措勤县"
            }
          ]
        }
      ]
    },
    {
      "id": 61,
      "pid": 0,
      "level": "province",
      "name": "陕西省",
      "children": [
        {
          "id": 6101,
          "pid": 61,
          "level": "city",
          "name": "西安市",
          "children": [
            {
              "id": 610102,
              "pid": 6101,
              "level": "district",
              "name": "新城区"
            },
            {
              "id": 610103,
              "pid": 6101,
              "level": "district",
              "name": "碑林区"
            },
            {
              "id": 610104,
              "pid": 6101,
              "level": "district",
              "name": "莲湖区"
            },
            {
              "id": 610111,
              "pid": 6101,
              "level": "district",
              "name": "灞桥区"
            },
            {
              "id": 610112,
              "pid": 6101,
              "level": "district",
              "name": "未央区"
            },
            {
              "id": 610113,
              "pid": 6101,
              "level": "district",
              "name": "雁塔区"
            },
            {
              "id": 610114,
              "pid": 6101,
              "level": "district",
              "name": "阎良区"
            },
            {
              "id": 610115,
              "pid": 6101,
              "level": "district",
              "name": "临潼区"
            },
            {
              "id": 610116,
              "pid": 6101,
              "level": "district",
              "name": "长安区"
            },
            {
              "id": 610117,
              "pid": 6101,
              "level": "district",
              "name": "高陵区"
            },
            {
              "id": 610118,
              "pid": 6101,
              "level": "district",
              "name": "鄠邑区"
            },
            {
              "id": 610122,
              "pid": 6101,
              "level": "district",
              "name": "蓝田县"
            },
            {
              "id": 610124,
              "pid": 6101,
              "level": "district",
              "name": "周至县"
            }
          ]
        },
        {
          "id": 6102,
          "pid": 61,
          "level": "city",
          "name": "铜川市",
          "children": [
            {
              "id": 610202,
              "pid": 6102,
              "level": "district",
              "name": "王益区"
            },
            {
              "id": 610203,
              "pid": 6102,
              "level": "district",
              "name": "印台区"
            },
            {
              "id": 610204,
              "pid": 6102,
              "level": "district",
              "name": "耀州区"
            },
            {
              "id": 610222,
              "pid": 6102,
              "level": "district",
              "name": "宜君县"
            }
          ]
        },
        {
          "id": 6103,
          "pid": 61,
          "level": "city",
          "name": "宝鸡市",
          "children": [
            {
              "id": 610302,
              "pid": 6103,
              "level": "district",
              "name": "渭滨区"
            },
            {
              "id": 610303,
              "pid": 6103,
              "level": "district",
              "name": "金台区"
            },
            {
              "id": 610304,
              "pid": 6103,
              "level": "district",
              "name": "陈仓区"
            },
            {
              "id": 610305,
              "pid": 6103,
              "level": "district",
              "name": "凤翔区"
            },
            {
              "id": 610323,
              "pid": 6103,
              "level": "district",
              "name": "岐山县"
            },
            {
              "id": 610324,
              "pid": 6103,
              "level": "district",
              "name": "扶风县"
            },
            {
              "id": 610326,
              "pid": 6103,
              "level": "district",
              "name": "眉县"
            },
            {
              "id": 610327,
              "pid": 6103,
              "level": "district",
              "name": "陇县"
            },
            {
              "id": 610328,
              "pid": 6103,
              "level": "district",
              "name": "千阳县"
            },
            {
              "id": 610329,
              "pid": 6103,
              "level": "district",
              "name": "麟游县"
            },
            {
              "id": 610330,
              "pid": 6103,
              "level": "district",
              "name": "凤县"
            },
            {
              "id": 610331,
              "pid": 6103,
              "level": "district",
              "name": "太白县"
            }
          ]
        },
        {
          "id": 6104,
          "pid": 61,
          "level": "city",
          "name": "咸阳市",
          "children": [
            {
              "id": 610402,
              "pid": 6104,
              "level": "district",
              "name": "秦都区"
            },
            {
              "id": 610403,
              "pid": 6104,
              "level": "district",
              "name": "杨陵区"
            },
            {
              "id": 610404,
              "pid": 6104,
              "level": "district",
              "name": "渭城区"
            },
            {
              "id": 610422,
              "pid": 6104,
              "level": "district",
              "name": "三原县"
            },
            {
              "id": 610423,
              "pid": 6104,
              "level": "district",
              "name": "泾阳县"
            },
            {
              "id": 610424,
              "pid": 6104,
              "level": "district",
              "name": "乾县"
            },
            {
              "id": 610425,
              "pid": 6104,
              "level": "district",
              "name": "礼泉县"
            },
            {
              "id": 610426,
              "pid": 6104,
              "level": "district",
              "name": "永寿县"
            },
            {
              "id": 610428,
              "pid": 6104,
              "level": "district",
              "name": "长武县"
            },
            {
              "id": 610429,
              "pid": 6104,
              "level": "district",
              "name": "旬邑县"
            },
            {
              "id": 610430,
              "pid": 6104,
              "level": "district",
              "name": "淳化县"
            },
            {
              "id": 610431,
              "pid": 6104,
              "level": "district",
              "name": "武功县"
            },
            {
              "id": 610481,
              "pid": 6104,
              "level": "district",
              "name": "兴平市"
            },
            {
              "id": 610482,
              "pid": 6104,
              "level": "district",
              "name": "彬州市"
            }
          ]
        },
        {
          "id": 6105,
          "pid": 61,
          "level": "city",
          "name": "渭南市",
          "children": [
            {
              "id": 610502,
              "pid": 6105,
              "level": "district",
              "name": "临渭区"
            },
            {
              "id": 610503,
              "pid": 6105,
              "level": "district",
              "name": "华州区"
            },
            {
              "id": 610522,
              "pid": 6105,
              "level": "district",
              "name": "潼关县"
            },
            {
              "id": 610523,
              "pid": 6105,
              "level": "district",
              "name": "大荔县"
            },
            {
              "id": 610524,
              "pid": 6105,
              "level": "district",
              "name": "合阳县"
            },
            {
              "id": 610525,
              "pid": 6105,
              "level": "district",
              "name": "澄城县"
            },
            {
              "id": 610526,
              "pid": 6105,
              "level": "district",
              "name": "蒲城县"
            },
            {
              "id": 610527,
              "pid": 6105,
              "level": "district",
              "name": "白水县"
            },
            {
              "id": 610528,
              "pid": 6105,
              "level": "district",
              "name": "富平县"
            },
            {
              "id": 610581,
              "pid": 6105,
              "level": "district",
              "name": "韩城市"
            },
            {
              "id": 610582,
              "pid": 6105,
              "level": "district",
              "name": "华阴市"
            }
          ]
        },
        {
          "id": 6106,
          "pid": 61,
          "level": "city",
          "name": "延安市",
          "children": [
            {
              "id": 610602,
              "pid": 6106,
              "level": "district",
              "name": "宝塔区"
            },
            {
              "id": 610603,
              "pid": 6106,
              "level": "district",
              "name": "安塞区"
            },
            {
              "id": 610621,
              "pid": 6106,
              "level": "district",
              "name": "延长县"
            },
            {
              "id": 610622,
              "pid": 6106,
              "level": "district",
              "name": "延川县"
            },
            {
              "id": 610625,
              "pid": 6106,
              "level": "district",
              "name": "志丹县"
            },
            {
              "id": 610626,
              "pid": 6106,
              "level": "district",
              "name": "吴起县"
            },
            {
              "id": 610627,
              "pid": 6106,
              "level": "district",
              "name": "甘泉县"
            },
            {
              "id": 610628,
              "pid": 6106,
              "level": "district",
              "name": "富县"
            },
            {
              "id": 610629,
              "pid": 6106,
              "level": "district",
              "name": "洛川县"
            },
            {
              "id": 610630,
              "pid": 6106,
              "level": "district",
              "name": "宜川县"
            },
            {
              "id": 610631,
              "pid": 6106,
              "level": "district",
              "name": "黄龙县"
            },
            {
              "id": 610632,
              "pid": 6106,
              "level": "district",
              "name": "黄陵县"
            },
            {
              "id": 610681,
              "pid": 6106,
              "level": "district",
              "name": "子长市"
            }
          ]
        },
        {
          "id": 6107,
          "pid": 61,
          "level": "city",
          "name": "汉中市",
          "children": [
            {
              "id": 610702,
              "pid": 6107,
              "level": "district",
              "name": "汉台区"
            },
            {
              "id": 610703,
              "pid": 6107,
              "level": "district",
              "name": "南郑区"
            },
            {
              "id": 610722,
              "pid": 6107,
              "level": "district",
              "name": "城固县"
            },
            {
              "id": 610723,
              "pid": 6107,
              "level": "district",
              "name": "洋县"
            },
            {
              "id": 610724,
              "pid": 6107,
              "level": "district",
              "name": "西乡县"
            },
            {
              "id": 610725,
              "pid": 6107,
              "level": "district",
              "name": "勉县"
            },
            {
              "id": 610726,
              "pid": 6107,
              "level": "district",
              "name": "宁强县"
            },
            {
              "id": 610727,
              "pid": 6107,
              "level": "district",
              "name": "略阳县"
            },
            {
              "id": 610728,
              "pid": 6107,
              "level": "district",
              "name": "镇巴县"
            },
            {
              "id": 610729,
              "pid": 6107,
              "level": "district",
              "name": "留坝县"
            },
            {
              "id": 610730,
              "pid": 6107,
              "level": "district",
              "name": "佛坪县"
            }
          ]
        },
        {
          "id": 6108,
          "pid": 61,
          "level": "city",
          "name": "榆林市",
          "children": [
            {
              "id": 610802,
              "pid": 6108,
              "level": "district",
              "name": "榆阳区"
            },
            {
              "id": 610803,
              "pid": 6108,
              "level": "district",
              "name": "横山区"
            },
            {
              "id": 610822,
              "pid": 6108,
              "level": "district",
              "name": "府谷县"
            },
            {
              "id": 610824,
              "pid": 6108,
              "level": "district",
              "name": "靖边县"
            },
            {
              "id": 610825,
              "pid": 6108,
              "level": "district",
              "name": "定边县"
            },
            {
              "id": 610826,
              "pid": 6108,
              "level": "district",
              "name": "绥德县"
            },
            {
              "id": 610827,
              "pid": 6108,
              "level": "district",
              "name": "米脂县"
            },
            {
              "id": 610828,
              "pid": 6108,
              "level": "district",
              "name": "佳县"
            },
            {
              "id": 610829,
              "pid": 6108,
              "level": "district",
              "name": "吴堡县"
            },
            {
              "id": 610830,
              "pid": 6108,
              "level": "district",
              "name": "清涧县"
            },
            {
              "id": 610831,
              "pid": 6108,
              "level": "district",
              "name": "子洲县"
            },
            {
              "id": 610881,
              "pid": 6108,
              "level": "district",
              "name": "神木市"
            }
          ]
        },
        {
          "id": 6109,
          "pid": 61,
          "level": "city",
          "name": "安康市",
          "children": [
            {
              "id": 610902,
              "pid": 6109,
              "level": "district",
              "name": "汉滨区"
            },
            {
              "id": 610921,
              "pid": 6109,
              "level": "district",
              "name": "汉阴县"
            },
            {
              "id": 610922,
              "pid": 6109,
              "level": "district",
              "name": "石泉县"
            },
            {
              "id": 610923,
              "pid": 6109,
              "level": "district",
              "name": "宁陕县"
            },
            {
              "id": 610924,
              "pid": 6109,
              "level": "district",
              "name": "紫阳县"
            },
            {
              "id": 610925,
              "pid": 6109,
              "level": "district",
              "name": "岚皋县"
            },
            {
              "id": 610926,
              "pid": 6109,
              "level": "district",
              "name": "平利县"
            },
            {
              "id": 610927,
              "pid": 6109,
              "level": "district",
              "name": "镇坪县"
            },
            {
              "id": 610929,
              "pid": 6109,
              "level": "district",
              "name": "白河县"
            },
            {
              "id": 610981,
              "pid": 6109,
              "level": "district",
              "name": "旬阳市"
            }
          ]
        },
        {
          "id": 6110,
          "pid": 61,
          "level": "city",
          "name": "商洛市",
          "children": [
            {
              "id": 611002,
              "pid": 6110,
              "level": "district",
              "name": "商州区"
            },
            {
              "id": 611021,
              "pid": 6110,
              "level": "district",
              "name": "洛南县"
            },
            {
              "id": 611022,
              "pid": 6110,
              "level": "district",
              "name": "丹凤县"
            },
            {
              "id": 611023,
              "pid": 6110,
              "level": "district",
              "name": "商南县"
            },
            {
              "id": 611024,
              "pid": 6110,
              "level": "district",
              "name": "山阳县"
            },
            {
              "id": 611025,
              "pid": 6110,
              "level": "district",
              "name": "镇安县"
            },
            {
              "id": 611026,
              "pid": 6110,
              "level": "district",
              "name": "柞水县"
            }
          ]
        }
      ]
    },
    {
      "id": 62,
      "pid": 0,
      "level": "province",
      "name": "甘肃省",
      "children": [
        {
          "id": 6201,
          "pid": 62,
          "level": "city",
          "name": "兰州市",
          "children": [
            {
              "id": 620102,
              "pid": 6201,
              "level": "district",
              "name": "城关区"
            },
            {
              "id": 620103,
              "pid": 6201,
              "level": "district",
              "name": "七里河区"
            },
            {
              "id": 620104,
              "pid": 6201,
              "level": "district",
              "name": "西固区"
            },
            {
              "id": 620105,
              "pid": 6201,
              "level": "district",
              "name": "安宁区"
            },
            {
              "id": 620111,
              "pid": 6201,
              "level": "district",
              "name": "红古区"
            },
            {
              "id": 620121,
              "pid": 6201,
              "level": "district",
              "name": "永登县"
            },
            {
              "id": 620122,
              "pid": 6201,
              "level": "district",
              "name": "皋兰县"
            },
            {
              "id": 620123,
              "pid": 6201,
              "level": "district",
              "name": "榆中县"
            },
            {
              "id": 620171,
              "pid": 6201,
              "level": "district",
              "name": "兰州新区"
            }
          ]
        },
        {
          "id": 6202,
          "pid": 62,
          "level": "city",
          "name": "嘉峪关市",
          "children": [
            {
              "id": 620201,
              "pid": 6202,
              "level": "district",
              "name": "嘉峪关市"
            }
          ]
        },
        {
          "id": 6203,
          "pid": 62,
          "level": "city",
          "name": "金昌市",
          "children": [
            {
              "id": 620302,
              "pid": 6203,
              "level": "district",
              "name": "金川区"
            },
            {
              "id": 620321,
              "pid": 6203,
              "level": "district",
              "name": "永昌县"
            }
          ]
        },
        {
          "id": 6204,
          "pid": 62,
          "level": "city",
          "name": "白银市",
          "children": [
            {
              "id": 620402,
              "pid": 6204,
              "level": "district",
              "name": "白银区"
            },
            {
              "id": 620403,
              "pid": 6204,
              "level": "district",
              "name": "平川区"
            },
            {
              "id": 620421,
              "pid": 6204,
              "level": "district",
              "name": "靖远县"
            },
            {
              "id": 620422,
              "pid": 6204,
              "level": "district",
              "name": "会宁县"
            },
            {
              "id": 620423,
              "pid": 6204,
              "level": "district",
              "name": "景泰县"
            }
          ]
        },
        {
          "id": 6205,
          "pid": 62,
          "level": "city",
          "name": "天水市",
          "children": [
            {
              "id": 620502,
              "pid": 6205,
              "level": "district",
              "name": "秦州区"
            },
            {
              "id": 620503,
              "pid": 6205,
              "level": "district",
              "name": "麦积区"
            },
            {
              "id": 620521,
              "pid": 6205,
              "level": "district",
              "name": "清水县"
            },
            {
              "id": 620522,
              "pid": 6205,
              "level": "district",
              "name": "秦安县"
            },
            {
              "id": 620523,
              "pid": 6205,
              "level": "district",
              "name": "甘谷县"
            },
            {
              "id": 620524,
              "pid": 6205,
              "level": "district",
              "name": "武山县"
            },
            {
              "id": 620525,
              "pid": 6205,
              "level": "district",
              "name": "张家川回族自治县"
            }
          ]
        },
        {
          "id": 6206,
          "pid": 62,
          "level": "city",
          "name": "武威市",
          "children": [
            {
              "id": 620602,
              "pid": 6206,
              "level": "district",
              "name": "凉州区"
            },
            {
              "id": 620621,
              "pid": 6206,
              "level": "district",
              "name": "民勤县"
            },
            {
              "id": 620622,
              "pid": 6206,
              "level": "district",
              "name": "古浪县"
            },
            {
              "id": 620623,
              "pid": 6206,
              "level": "district",
              "name": "天祝藏族自治县"
            }
          ]
        },
        {
          "id": 6207,
          "pid": 62,
          "level": "city",
          "name": "张掖市",
          "children": [
            {
              "id": 620702,
              "pid": 6207,
              "level": "district",
              "name": "甘州区"
            },
            {
              "id": 620721,
              "pid": 6207,
              "level": "district",
              "name": "肃南裕固族自治县"
            },
            {
              "id": 620722,
              "pid": 6207,
              "level": "district",
              "name": "民乐县"
            },
            {
              "id": 620723,
              "pid": 6207,
              "level": "district",
              "name": "临泽县"
            },
            {
              "id": 620724,
              "pid": 6207,
              "level": "district",
              "name": "高台县"
            },
            {
              "id": 620725,
              "pid": 6207,
              "level": "district",
              "name": "山丹县"
            }
          ]
        },
        {
          "id": 6208,
          "pid": 62,
          "level": "city",
          "name": "平凉市",
          "children": [
            {
              "id": 620802,
              "pid": 6208,
              "level": "district",
              "name": "崆峒区"
            },
            {
              "id": 620821,
              "pid": 6208,
              "level": "district",
              "name": "泾川县"
            },
            {
              "id": 620822,
              "pid": 6208,
              "level": "district",
              "name": "灵台县"
            },
            {
              "id": 620823,
              "pid": 6208,
              "level": "district",
              "name": "崇信县"
            },
            {
              "id": 620825,
              "pid": 6208,
              "level": "district",
              "name": "庄浪县"
            },
            {
              "id": 620826,
              "pid": 6208,
              "level": "district",
              "name": "静宁县"
            },
            {
              "id": 620881,
              "pid": 6208,
              "level": "district",
              "name": "华亭市"
            }
          ]
        },
        {
          "id": 6209,
          "pid": 62,
          "level": "city",
          "name": "酒泉市",
          "children": [
            {
              "id": 620902,
              "pid": 6209,
              "level": "district",
              "name": "肃州区"
            },
            {
              "id": 620921,
              "pid": 6209,
              "level": "district",
              "name": "金塔县"
            },
            {
              "id": 620922,
              "pid": 6209,
              "level": "district",
              "name": "瓜州县"
            },
            {
              "id": 620923,
              "pid": 6209,
              "level": "district",
              "name": "肃北蒙古族自治县"
            },
            {
              "id": 620924,
              "pid": 6209,
              "level": "district",
              "name": "阿克塞哈萨克族自治县"
            },
            {
              "id": 620981,
              "pid": 6209,
              "level": "district",
              "name": "玉门市"
            },
            {
              "id": 620982,
              "pid": 6209,
              "level": "district",
              "name": "敦煌市"
            }
          ]
        },
        {
          "id": 6210,
          "pid": 62,
          "level": "city",
          "name": "庆阳市",
          "children": [
            {
              "id": 621002,
              "pid": 6210,
              "level": "district",
              "name": "西峰区"
            },
            {
              "id": 621021,
              "pid": 6210,
              "level": "district",
              "name": "庆城县"
            },
            {
              "id": 621022,
              "pid": 6210,
              "level": "district",
              "name": "环县"
            },
            {
              "id": 621023,
              "pid": 6210,
              "level": "district",
              "name": "华池县"
            },
            {
              "id": 621024,
              "pid": 6210,
              "level": "district",
              "name": "合水县"
            },
            {
              "id": 621025,
              "pid": 6210,
              "level": "district",
              "name": "正宁县"
            },
            {
              "id": 621026,
              "pid": 6210,
              "level": "district",
              "name": "宁县"
            },
            {
              "id": 621027,
              "pid": 6210,
              "level": "district",
              "name": "镇原县"
            }
          ]
        },
        {
          "id": 6211,
          "pid": 62,
          "level": "city",
          "name": "定西市",
          "children": [
            {
              "id": 621102,
              "pid": 6211,
              "level": "district",
              "name": "安定区"
            },
            {
              "id": 621121,
              "pid": 6211,
              "level": "district",
              "name": "通渭县"
            },
            {
              "id": 621122,
              "pid": 6211,
              "level": "district",
              "name": "陇西县"
            },
            {
              "id": 621123,
              "pid": 6211,
              "level": "district",
              "name": "渭源县"
            },
            {
              "id": 621124,
              "pid": 6211,
              "level": "district",
              "name": "临洮县"
            },
            {
              "id": 621125,
              "pid": 6211,
              "level": "district",
              "name": "漳县"
            },
            {
              "id": 621126,
              "pid": 6211,
              "level": "district",
              "name": "岷县"
            }
          ]
        },
        {
          "id": 6212,
          "pid": 62,
          "level": "city",
          "name": "陇南市",
          "children": [
            {
              "id": 621202,
              "pid": 6212,
              "level": "district",
              "name": "武都区"
            },
            {
              "id": 621221,
              "pid": 6212,
              "level": "district",
              "name": "成县"
            },
            {
              "id": 621222,
              "pid": 6212,
              "level": "district",
              "name": "文县"
            },
            {
              "id": 621223,
              "pid": 6212,
              "level": "district",
              "name": "宕昌县"
            },
            {
              "id": 621224,
              "pid": 6212,
              "level": "district",
              "name": "康县"
            },
            {
              "id": 621225,
              "pid": 6212,
              "level": "district",
              "name": "西和县"
            },
            {
              "id": 621226,
              "pid": 6212,
              "level": "district",
              "name": "礼县"
            },
            {
              "id": 621227,
              "pid": 6212,
              "level": "district",
              "name": "徽县"
            },
            {
              "id": 621228,
              "pid": 6212,
              "level": "district",
              "name": "两当县"
            }
          ]
        },
        {
          "id": 6229,
          "pid": 62,
          "level": "city",
          "name": "临夏回族自治州",
          "children": [
            {
              "id": 622901,
              "pid": 6229,
              "level": "district",
              "name": "临夏市"
            },
            {
              "id": 622921,
              "pid": 6229,
              "level": "district",
              "name": "临夏县"
            },
            {
              "id": 622922,
              "pid": 6229,
              "level": "district",
              "name": "康乐县"
            },
            {
              "id": 622923,
              "pid": 6229,
              "level": "district",
              "name": "永靖县"
            },
            {
              "id": 622924,
              "pid": 6229,
              "level": "district",
              "name": "广河县"
            },
            {
              "id": 622925,
              "pid": 6229,
              "level": "district",
              "name": "和政县"
            },
            {
              "id": 622926,
              "pid": 6229,
              "level": "district",
              "name": "东乡族自治县"
            },
            {
              "id": 622927,
              "pid": 6229,
              "level": "district",
              "name": "积石山保安族东乡族撒拉族自治县"
            }
          ]
        },
        {
          "id": 6230,
          "pid": 62,
          "level": "city",
          "name": "甘南藏族自治州",
          "children": [
            {
              "id": 623001,
              "pid": 6230,
              "level": "district",
              "name": "合作市"
            },
            {
              "id": 623021,
              "pid": 6230,
              "level": "district",
              "name": "临潭县"
            },
            {
              "id": 623022,
              "pid": 6230,
              "level": "district",
              "name": "卓尼县"
            },
            {
              "id": 623023,
              "pid": 6230,
              "level": "district",
              "name": "舟曲县"
            },
            {
              "id": 623024,
              "pid": 6230,
              "level": "district",
              "name": "迭部县"
            },
            {
              "id": 623025,
              "pid": 6230,
              "level": "district",
              "name": "玛曲县"
            },
            {
              "id": 623026,
              "pid": 6230,
              "level": "district",
              "name": "碌曲县"
            },
            {
              "id": 623027,
              "pid": 6230,
              "level": "district",
              "name": "夏河县"
            }
          ]
        }
      ]
    },
    {
      "id": 63,
      "pid": 0,
      "level": "province",
      "name": "青海省",
      "children": [
        {
          "id": 6301,
          "pid": 63,
          "level": "city",
          "name": "西宁市",
          "children": [
            {
              "id": 630102,
              "pid": 6301,
              "level": "district",
              "name": "城东区"
            },
            {
              "id": 630103,
              "pid": 6301,
              "level": "district",
              "name": "城中区"
            },
            {
              "id": 630104,
              "pid": 6301,
              "level": "district",
              "name": "城西区"
            },
            {
              "id": 630105,
              "pid": 6301,
              "level": "district",
              "name": "城北区"
            },
            {
              "id": 630106,
              "pid": 6301,
              "level": "district",
              "name": "湟中区"
            },
            {
              "id": 630121,
              "pid": 6301,
              "level": "district",
              "name": "大通回族土族自治县"
            },
            {
              "id": 630123,
              "pid": 6301,
              "level": "district",
              "name": "湟源县"
            }
          ]
        },
        {
          "id": 6302,
          "pid": 63,
          "level": "city",
          "name": "海东市",
          "children": [
            {
              "id": 630202,
              "pid": 6302,
              "level": "district",
              "name": "乐都区"
            },
            {
              "id": 630203,
              "pid": 6302,
              "level": "district",
              "name": "平安区"
            },
            {
              "id": 630222,
              "pid": 6302,
              "level": "district",
              "name": "民和回族土族自治县"
            },
            {
              "id": 630223,
              "pid": 6302,
              "level": "district",
              "name": "互助土族自治县"
            },
            {
              "id": 630224,
              "pid": 6302,
              "level": "district",
              "name": "化隆回族自治县"
            },
            {
              "id": 630225,
              "pid": 6302,
              "level": "district",
              "name": "循化撒拉族自治县"
            }
          ]
        },
        {
          "id": 6322,
          "pid": 63,
          "level": "city",
          "name": "海北藏族自治州",
          "children": [
            {
              "id": 632221,
              "pid": 6322,
              "level": "district",
              "name": "门源回族自治县"
            },
            {
              "id": 632222,
              "pid": 6322,
              "level": "district",
              "name": "祁连县"
            },
            {
              "id": 632223,
              "pid": 6322,
              "level": "district",
              "name": "海晏县"
            },
            {
              "id": 632224,
              "pid": 6322,
              "level": "district",
              "name": "刚察县"
            }
          ]
        },
        {
          "id": 6323,
          "pid": 63,
          "level": "city",
          "name": "黄南藏族自治州",
          "children": [
            {
              "id": 632301,
              "pid": 6323,
              "level": "district",
              "name": "同仁市"
            },
            {
              "id": 632322,
              "pid": 6323,
              "level": "district",
              "name": "尖扎县"
            },
            {
              "id": 632323,
              "pid": 6323,
              "level": "district",
              "name": "泽库县"
            },
            {
              "id": 632324,
              "pid": 6323,
              "level": "district",
              "name": "河南蒙古族自治县"
            }
          ]
        },
        {
          "id": 6325,
          "pid": 63,
          "level": "city",
          "name": "海南藏族自治州",
          "children": [
            {
              "id": 632521,
              "pid": 6325,
              "level": "district",
              "name": "共和县"
            },
            {
              "id": 632522,
              "pid": 6325,
              "level": "district",
              "name": "同德县"
            },
            {
              "id": 632523,
              "pid": 6325,
              "level": "district",
              "name": "贵德县"
            },
            {
              "id": 632524,
              "pid": 6325,
              "level": "district",
              "name": "兴海县"
            },
            {
              "id": 632525,
              "pid": 6325,
              "level": "district",
              "name": "贵南县"
            }
          ]
        },
        {
          "id": 6326,
          "pid": 63,
          "level": "city",
          "name": "果洛藏族自治州",
          "children": [
            {
              "id": 632621,
              "pid": 6326,
              "level": "district",
              "name": "玛沁县"
            },
            {
              "id": 632622,
              "pid": 6326,
              "level": "district",
              "name": "班玛县"
            },
            {
              "id": 632623,
              "pid": 6326,
              "level": "district",
              "name": "甘德县"
            },
            {
              "id": 632624,
              "pid": 6326,
              "level": "district",
              "name": "达日县"
            },
            {
              "id": 632625,
              "pid": 6326,
              "level": "district",
              "name": "久治县"
            },
            {
              "id": 632626,
              "pid": 6326,
              "level": "district",
              "name": "玛多县"
            }
          ]
        },
        {
          "id": 6327,
          "pid": 63,
          "level": "city",
          "name": "玉树藏族自治州",
          "children": [
            {
              "id": 632701,
              "pid": 6327,
              "level": "district",
              "name": "玉树市"
            },
            {
              "id": 632722,
              "pid": 6327,
              "level": "district",
              "name": "杂多县"
            },
            {
              "id": 632723,
              "pid": 6327,
              "level": "district",
              "name": "称多县"
            },
            {
              "id": 632724,
              "pid": 6327,
              "level": "district",
              "name": "治多县"
            },
            {
              "id": 632725,
              "pid": 6327,
              "level": "district",
              "name": "囊谦县"
            },
            {
              "id": 632726,
              "pid": 6327,
              "level": "district",
              "name": "曲麻莱县"
            }
          ]
        },
        {
          "id": 6328,
          "pid": 63,
          "level": "city",
          "name": "海西蒙古族藏族自治州",
          "children": [
            {
              "id": 632801,
              "pid": 6328,
              "level": "district",
              "name": "格尔木市"
            },
            {
              "id": 632802,
              "pid": 6328,
              "level": "district",
              "name": "德令哈市"
            },
            {
              "id": 632803,
              "pid": 6328,
              "level": "district",
              "name": "茫崖市"
            },
            {
              "id": 632821,
              "pid": 6328,
              "level": "district",
              "name": "乌兰县"
            },
            {
              "id": 632822,
              "pid": 6328,
              "level": "district",
              "name": "都兰县"
            },
            {
              "id": 632823,
              "pid": 6328,
              "level": "district",
              "name": "天峻县"
            },
            {
              "id": 632857,
              "pid": 6328,
              "level": "district",
              "name": "大柴旦行政委员会"
            }
          ]
        }
      ]
    },
    {
      "id": 64,
      "pid": 0,
      "level": "province",
      "name": "宁夏回族自治区",
      "children": [
        {
          "id": 6401,
          "pid": 64,
          "level": "city",
          "name": "银川市",
          "children": [
            {
              "id": 640104,
              "pid": 6401,
              "level": "district",
              "name": "兴庆区"
            },
            {
              "id": 640105,
              "pid": 6401,
              "level": "district",
              "name": "西夏区"
            },
            {
              "id": 640106,
              "pid": 6401,
              "level": "district",
              "name": "金凤区"
            },
            {
              "id": 640121,
              "pid": 6401,
              "level": "district",
              "name": "永宁县"
            },
            {
              "id": 640122,
              "pid": 6401,
              "level": "district",
              "name": "贺兰县"
            },
            {
              "id": 640181,
              "pid": 6401,
              "level": "district",
              "name": "灵武市"
            }
          ]
        },
        {
          "id": 6402,
          "pid": 64,
          "level": "city",
          "name": "石嘴山市",
          "children": [
            {
              "id": 640202,
              "pid": 6402,
              "level": "district",
              "name": "大武口区"
            },
            {
              "id": 640205,
              "pid": 6402,
              "level": "district",
              "name": "惠农区"
            },
            {
              "id": 640221,
              "pid": 6402,
              "level": "district",
              "name": "平罗县"
            }
          ]
        },
        {
          "id": 6403,
          "pid": 64,
          "level": "city",
          "name": "吴忠市",
          "children": [
            {
              "id": 640302,
              "pid": 6403,
              "level": "district",
              "name": "利通区"
            },
            {
              "id": 640303,
              "pid": 6403,
              "level": "district",
              "name": "红寺堡区"
            },
            {
              "id": 640323,
              "pid": 6403,
              "level": "district",
              "name": "盐池县"
            },
            {
              "id": 640324,
              "pid": 6403,
              "level": "district",
              "name": "同心县"
            },
            {
              "id": 640381,
              "pid": 6403,
              "level": "district",
              "name": "青铜峡市"
            }
          ]
        },
        {
          "id": 6404,
          "pid": 64,
          "level": "city",
          "name": "固原市",
          "children": [
            {
              "id": 640402,
              "pid": 6404,
              "level": "district",
              "name": "原州区"
            },
            {
              "id": 640422,
              "pid": 6404,
              "level": "district",
              "name": "西吉县"
            },
            {
              "id": 640423,
              "pid": 6404,
              "level": "district",
              "name": "隆德县"
            },
            {
              "id": 640424,
              "pid": 6404,
              "level": "district",
              "name": "泾源县"
            },
            {
              "id": 640425,
              "pid": 6404,
              "level": "district",
              "name": "彭阳县"
            }
          ]
        },
        {
          "id": 6405,
          "pid": 64,
          "level": "city",
          "name": "中卫市",
          "children": [
            {
              "id": 640502,
              "pid": 6405,
              "level": "district",
              "name": "沙坡头区"
            },
            {
              "id": 640521,
              "pid": 6405,
              "level": "district",
              "name": "中宁县"
            },
            {
              "id": 640522,
              "pid": 6405,
              "level": "district",
              "name": "海原县"
            }
          ]
        }
      ]
    },
    {
      "id": 65,
      "pid": 0,
      "level": "province",
      "name": "新疆维吾尔自治区",
      "children": [
        {
          "id": 6501,
          "pid": 65,
          "level": "city",
          "name": "乌鲁木齐市",
          "children": [
            {
              "id": 650102,
              "pid": 6501,
              "level": "district",
              "name": "天山区"
            },
            {
              "id": 650103,
              "pid": 6501,
              "level": "district",
              "name": "沙依巴克区"
            },
            {
              "id": 650104,
              "pid": 6501,
              "level": "district",
              "name": "新市区"
            },
            {
              "id": 650105,
              "pid": 6501,
              "level": "district",
              "name": "水磨沟区"
            },
            {
              "id": 650106,
              "pid": 6501,
              "level": "district",
              "name": "头屯河区"
            },
            {
              "id": 650107,
              "pid": 6501,
              "level": "district",
              "name": "达坂城区"
            },
            {
              "id": 650109,
              "pid": 6501,
              "level": "district",
              "name": "米东区"
            },
            {
              "id": 650121,
              "pid": 6501,
              "level": "district",
              "name": "乌鲁木齐县"
            }
          ]
        },
        {
          "id": 6502,
          "pid": 65,
          "level": "city",
          "name": "克拉玛依市",
          "children": [
            {
              "id": 650202,
              "pid": 6502,
              "level": "district",
              "name": "独山子区"
            },
            {
              "id": 650203,
              "pid": 6502,
              "level": "district",
              "name": "克拉玛依区"
            },
            {
              "id": 650204,
              "pid": 6502,
              "level": "district",
              "name": "白碱滩区"
            },
            {
              "id": 650205,
              "pid": 6502,
              "level": "district",
              "name": "乌尔禾区"
            }
          ]
        },
        {
          "id": 6504,
          "pid": 65,
          "level": "city",
          "name": "吐鲁番市",
          "children": [
            {
              "id": 650402,
              "pid": 6504,
              "level": "district",
              "name": "高昌区"
            },
            {
              "id": 650421,
              "pid": 6504,
              "level": "district",
              "name": "鄯善县"
            },
            {
              "id": 650422,
              "pid": 6504,
              "level": "district",
              "name": "托克逊县"
            }
          ]
        },
        {
          "id": 6505,
          "pid": 65,
          "level": "city",
          "name": "哈密市",
          "children": [
            {
              "id": 650502,
              "pid": 6505,
              "level": "district",
              "name": "伊州区"
            },
            {
              "id": 650521,
              "pid": 6505,
              "level": "district",
              "name": "巴里坤哈萨克自治县"
            },
            {
              "id": 650522,
              "pid": 6505,
              "level": "district",
              "name": "伊吾县"
            }
          ]
        },
        {
          "id": 6523,
          "pid": 65,
          "level": "city",
          "name": "昌吉回族自治州",
          "children": [
            {
              "id": 652301,
              "pid": 6523,
              "level": "district",
              "name": "昌吉市"
            },
            {
              "id": 652302,
              "pid": 6523,
              "level": "district",
              "name": "阜康市"
            },
            {
              "id": 652323,
              "pid": 6523,
              "level": "district",
              "name": "呼图壁县"
            },
            {
              "id": 652324,
              "pid": 6523,
              "level": "district",
              "name": "玛纳斯县"
            },
            {
              "id": 652325,
              "pid": 6523,
              "level": "district",
              "name": "奇台县"
            },
            {
              "id": 652327,
              "pid": 6523,
              "level": "district",
              "name": "吉木萨尔县"
            },
            {
              "id": 652328,
              "pid": 6523,
              "level": "district",
              "name": "木垒哈萨克自治县"
            }
          ]
        },
        {
          "id": 6527,
          "pid": 65,
          "level": "city",
          "name": "博尔塔拉蒙古自治州",
          "children": [
            {
              "id": 652701,
              "pid": 6527,
              "level": "district",
              "name": "博乐市"
            },
            {
              "id": 652702,
              "pid": 6527,
              "level": "district",
              "name": "阿拉山口市"
            },
            {
              "id": 652722,
              "pid": 6527,
              "level": "district",
              "name": "精河县"
            },
            {
              "id": 652723,
              "pid": 6527,
              "level": "district",
              "name": "温泉县"
            }
          ]
        },
        {
          "id": 6528,
          "pid": 65,
          "level": "city",
          "name": "巴音郭楞蒙古自治州",
          "children": [
            {
              "id": 652801,
              "pid": 6528,
              "level": "district",
              "name": "库尔勒市"
            },
            {
              "id": 652822,
              "pid": 6528,
              "level": "district",
              "name": "轮台县"
            },
            {
              "id": 652823,
              "pid": 6528,
              "level": "district",
              "name": "尉犁县"
            },
            {
              "id": 652824,
              "pid": 6528,
              "level": "district",
              "name": "若羌县"
            },
            {
              "id": 652825,
              "pid": 6528,
              "level": "district",
              "name": "且末县"
            },
            {
              "id": 652826,
              "pid": 6528,
              "level": "district",
              "name": "焉耆回族自治县"
            },
            {
              "id": 652827,
              "pid": 6528,
              "level": "district",
              "name": "和静县"
            },
            {
              "id": 652828,
              "pid": 6528,
              "level": "district",
              "name": "和硕县"
            },
            {
              "id": 652829,
              "pid": 6528,
              "level": "district",
              "name": "博湖县"
            },
            {
              "id": 652871,
              "pid": 6528,
              "level": "district",
              "name": "库尔勒经济技术开发区"
            }
          ]
        },
        {
          "id": 6529,
          "pid": 65,
          "level": "city",
          "name": "阿克苏地区",
          "children": [
            {
              "id": 652901,
              "pid": 6529,
              "level": "district",
              "name": "阿克苏市"
            },
            {
              "id": 652902,
              "pid": 6529,
              "level": "district",
              "name": "库车市"
            },
            {
              "id": 652922,
              "pid": 6529,
              "level": "district",
              "name": "温宿县"
            },
            {
              "id": 652924,
              "pid": 6529,
              "level": "district",
              "name": "沙雅县"
            },
            {
              "id": 652925,
              "pid": 6529,
              "level": "district",
              "name": "新和县"
            },
            {
              "id": 652926,
              "pid": 6529,
              "level": "district",
              "name": "拜城县"
            },
            {
              "id": 652927,
              "pid": 6529,
              "level": "district",
              "name": "乌什县"
            },
            {
              "id": 652928,
              "pid": 6529,
              "level": "district",
              "name": "阿瓦提县"
            },
            {
              "id": 652929,
              "pid": 6529,
              "level": "district",
              "name": "柯坪县"
            }
          ]
        },
        {
          "id": 6530,
          "pid": 65,
          "level": "city",
          "name": "克孜勒苏柯尔克孜自治州",
          "children": [
            {
              "id": 653001,
              "pid": 6530,
              "level": "district",
              "name": "阿图什市"
            },
            {
              "id": 653022,
              "pid": 6530,
              "level": "district",
              "name": "阿克陶县"
            },
            {
              "id": 653023,
              "pid": 6530,
              "level": "district",
              "name": "阿合奇县"
            },
            {
              "id": 653024,
              "pid": 6530,
              "level": "district",
              "name": "乌恰县"
            }
          ]
        },
        {
          "id": 6531,
          "pid": 65,
          "level": "city",
          "name": "喀什地区",
          "children": [
            {
              "id": 653101,
              "pid": 6531,
              "level": "district",
              "name": "喀什市"
            },
            {
              "id": 653121,
              "pid": 6531,
              "level": "district",
              "name": "疏附县"
            },
            {
              "id": 653122,
              "pid": 6531,
              "level": "district",
              "name": "疏勒县"
            },
            {
              "id": 653123,
              "pid": 6531,
              "level": "district",
              "name": "英吉沙县"
            },
            {
              "id": 653124,
              "pid": 6531,
              "level": "district",
              "name": "泽普县"
            },
            {
              "id": 653125,
              "pid": 6531,
              "level": "district",
              "name": "莎车县"
            },
            {
              "id": 653126,
              "pid": 6531,
              "level": "district",
              "name": "叶城县"
            },
            {
              "id": 653127,
              "pid": 6531,
              "level": "district",
              "name": "麦盖提县"
            },
            {
              "id": 653128,
              "pid": 6531,
              "level": "district",
              "name": "岳普湖县"
            },
            {
              "id": 653129,
              "pid": 6531,
              "level": "district",
              "name": "伽师县"
            },
            {
              "id": 653130,
              "pid": 6531,
              "level": "district",
              "name": "巴楚县"
            },
            {
              "id": 653131,
              "pid": 6531,
              "level": "district",
              "name": "塔什库尔干塔吉克自治县"
            }
          ]
        },
        {
          "id": 6532,
          "pid": 65,
          "level": "city",
          "name": "和田地区",
          "children": [
            {
              "id": 653201,
              "pid": 6532,
              "level": "district",
              "name": "和田市"
            },
            {
              "id": 653221,
              "pid": 6532,
              "level": "district",
              "name": "和田县"
            },
            {
              "id": 653222,
              "pid": 6532,
              "level": "district",
              "name": "墨玉县"
            },
            {
              "id": 653223,
              "pid": 6532,
              "level": "district",
              "name": "皮山县"
            },
            {
              "id": 653224,
              "pid": 6532,
              "level": "district",
              "name": "洛浦县"
            },
            {
              "id": 653225,
              "pid": 6532,
              "level": "district",
              "name": "策勒县"
            },
            {
              "id": 653226,
              "pid": 6532,
              "level": "district",
              "name": "于田县"
            },
            {
              "id": 653227,
              "pid": 6532,
              "level": "district",
              "name": "民丰县"
            }
          ]
        },
        {
          "id": 6540,
          "pid": 65,
          "level": "city",
          "name": "伊犁哈萨克自治州",
          "children": [
            {
              "id": 654002,
              "pid": 6540,
              "level": "district",
              "name": "伊宁市"
            },
            {
              "id": 654003,
              "pid": 6540,
              "level": "district",
              "name": "奎屯市"
            },
            {
              "id": 654004,
              "pid": 6540,
              "level": "district",
              "name": "霍尔果斯市"
            },
            {
              "id": 654021,
              "pid": 6540,
              "level": "district",
              "name": "伊宁县"
            },
            {
              "id": 654022,
              "pid": 6540,
              "level": "district",
              "name": "察布查尔锡伯自治县"
            },
            {
              "id": 654023,
              "pid": 6540,
              "level": "district",
              "name": "霍城县"
            },
            {
              "id": 654024,
              "pid": 6540,
              "level": "district",
              "name": "巩留县"
            },
            {
              "id": 654025,
              "pid": 6540,
              "level": "district",
              "name": "新源县"
            },
            {
              "id": 654026,
              "pid": 6540,
              "level": "district",
              "name": "昭苏县"
            },
            {
              "id": 654027,
              "pid": 6540,
              "level": "district",
              "name": "特克斯县"
            },
            {
              "id": 654028,
              "pid": 6540,
              "level": "district",
              "name": "尼勒克县"
            }
          ]
        },
        {
          "id": 6542,
          "pid": 65,
          "level": "city",
          "name": "塔城地区",
          "children": [
            {
              "id": 654201,
              "pid": 6542,
              "level": "district",
              "name": "塔城市"
            },
            {
              "id": 654202,
              "pid": 6542,
              "level": "district",
              "name": "乌苏市"
            },
            {
              "id": 654203,
              "pid": 6542,
              "level": "district",
              "name": "沙湾市"
            },
            {
              "id": 654221,
              "pid": 6542,
              "level": "district",
              "name": "额敏县"
            },
            {
              "id": 654224,
              "pid": 6542,
              "level": "district",
              "name": "托里县"
            },
            {
              "id": 654225,
              "pid": 6542,
              "level": "district",
              "name": "裕民县"
            },
            {
              "id": 654226,
              "pid": 6542,
              "level": "district",
              "name": "和布克赛尔蒙古自治县"
            }
          ]
        },
        {
          "id": 6543,
          "pid": 65,
          "level": "city",
          "name": "阿勒泰地区",
          "children": [
            {
              "id": 654301,
              "pid": 6543,
              "level": "district",
              "name": "阿勒泰市"
            },
            {
              "id": 654321,
              "pid": 6543,
              "level": "district",
              "name": "布尔津县"
            },
            {
              "id": 654322,
              "pid": 6543,
              "level": "district",
              "name": "富蕴县"
            },
            {
              "id": 654323,
              "pid": 6543,
              "level": "district",
              "name": "福海县"
            },
            {
              "id": 654324,
              "pid": 6543,
              "level": "district",
              "name": "哈巴河县"
            },
            {
              "id": 654325,
              "pid": 6543,
              "level": "district",
              "name": "青河县"
            },
            {
              "id": 654326,
              "pid": 6543,
              "level": "district",
              "name": "吉木乃县"
            }
          ]
        },
        {
          "id": 6590,
          "pid": 65,
          "level": "city",
          "name": "自治区直辖县级行政区划",
          "children": [
            {
              "id": 659001,
              "pid": 6590,
              "level": "district",
              "name": "石河子市"
            },
            {
              "id": 659002,
              "pid": 6590,
              "level": "district",
              "name": "阿拉尔市"
            },
            {
              "id": 659003,
              "pid": 6590,
              "level": "district",
              "name": "图木舒克市"
            },
            {
              "id": 659004,
              "pid": 6590,
              "level": "district",
              "name": "五家渠市"
            },
            {
              "id": 659005,
              "pid": 6590,
              "level": "district",
              "name": "北屯市"
            },
            {
              "id": 659006,
              "pid": 6590,
              "level": "district",
              "name": "铁门关市"
            },
            {
              "id": 659007,
              "pid": 6590,
              "level": "district",
              "name": "双河市"
            },
            {
              "id": 659008,
              "pid": 6590,
              "level": "district",
              "name": "可克达拉市"
            },
            {
              "id": 659009,
              "pid": 6590,
              "level": "district",
              "name": "昆玉市"
            },
            {
              "id": 659010,
              "pid": 6590,
              "level": "district",
              "name": "胡杨河市"
            },
            {
              "id": 659011,
              "pid": 6590,
              "level": "district",
              "name": "新星市"
            }
          ]
        }
      ]
    },
    {
      "id": 71,
      "pid": 0,
      "level": "province",
      "name": "台湾省",
      "children": [
        {
          "id": 7110,
          "pid": 71,
          "level": "city",
          "name": "台北市",
          "children": [
            {
              "id": 711001,
              "pid": 7110,
              "level": "district",
              "name": "松山区"
            },
            {
              "id": 711002,
              "pid": 7110,
              "level": "district",
              "name": "大安区"
            },
            {
              "id": 711003,
              "pid": 7110,
              "level": "district",
              "name": "中正区"
            },
            {
              "id": 711005,
              "pid": 7110,
              "level": "district",
              "name": "万华区"
            },
            {
              "id": 711009,
              "pid": 7110,
              "level": "district",
              "name": "大同区"
            },
            {
              "id": 711010,
              "pid": 7110,
              "level": "district",
              "name": "中山区"
            },
            {
              "id": 711011,
              "pid": 7110,
              "level": "district",
              "name": "文山区"
            },
            {
              "id": 711013,
              "pid": 7110,
              "level": "district",
              "name": "南港区"
            },
            {
              "id": 711014,
              "pid": 7110,
              "level": "district",
              "name": "内湖区"
            },
            {
              "id": 711015,
              "pid": 7110,
              "level": "district",
              "name": "士林区"
            },
            {
              "id": 711016,
              "pid": 7110,
              "level": "district",
              "name": "北投区"
            },
            {
              "id": 711017,
              "pid": 7110,
              "level": "district",
              "name": "信义区"
            }
          ]
        },
        {
          "id": 7111,
          "pid": 71,
          "level": "city",
          "name": "台中市",
          "children": [
            {
              "id": 711101,
              "pid": 7111,
              "level": "district",
              "name": "中区"
            },
            {
              "id": 711102,
              "pid": 7111,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 711103,
              "pid": 7111,
              "level": "district",
              "name": "西区"
            },
            {
              "id": 711104,
              "pid": 7111,
              "level": "district",
              "name": "南区"
            },
            {
              "id": 711105,
              "pid": 7111,
              "level": "district",
              "name": "北区"
            },
            {
              "id": 711106,
              "pid": 7111,
              "level": "district",
              "name": "西屯区"
            },
            {
              "id": 711107,
              "pid": 7111,
              "level": "district",
              "name": "南屯区"
            },
            {
              "id": 711108,
              "pid": 7111,
              "level": "district",
              "name": "北屯区"
            },
            {
              "id": 711141,
              "pid": 7111,
              "level": "district",
              "name": "丰原区"
            },
            {
              "id": 711142,
              "pid": 7111,
              "level": "district",
              "name": "东势区"
            },
            {
              "id": 711143,
              "pid": 7111,
              "level": "district",
              "name": "大甲区"
            },
            {
              "id": 711144,
              "pid": 7111,
              "level": "district",
              "name": "清水区"
            },
            {
              "id": 711145,
              "pid": 7111,
              "level": "district",
              "name": "沙鹿区"
            },
            {
              "id": 711146,
              "pid": 7111,
              "level": "district",
              "name": "梧栖区"
            },
            {
              "id": 711147,
              "pid": 7111,
              "level": "district",
              "name": "神冈区"
            },
            {
              "id": 711148,
              "pid": 7111,
              "level": "district",
              "name": "后里区"
            },
            {
              "id": 711149,
              "pid": 7111,
              "level": "district",
              "name": "大雅区"
            },
            {
              "id": 711150,
              "pid": 7111,
              "level": "district",
              "name": "潭子区"
            },
            {
              "id": 711151,
              "pid": 7111,
              "level": "district",
              "name": "新社区"
            },
            {
              "id": 711152,
              "pid": 7111,
              "level": "district",
              "name": "石冈区"
            },
            {
              "id": 711153,
              "pid": 7111,
              "level": "district",
              "name": "外埔区"
            },
            {
              "id": 711154,
              "pid": 7111,
              "level": "district",
              "name": "大安区"
            },
            {
              "id": 711155,
              "pid": 7111,
              "level": "district",
              "name": "乌日区"
            },
            {
              "id": 711156,
              "pid": 7111,
              "level": "district",
              "name": "大肚区"
            },
            {
              "id": 711157,
              "pid": 7111,
              "level": "district",
              "name": "龙井区"
            },
            {
              "id": 711158,
              "pid": 7111,
              "level": "district",
              "name": "雾峰区"
            },
            {
              "id": 711159,
              "pid": 7111,
              "level": "district",
              "name": "太平区"
            },
            {
              "id": 711160,
              "pid": 7111,
              "level": "district",
              "name": "大里区"
            },
            {
              "id": 711161,
              "pid": 7111,
              "level": "district",
              "name": "和平区"
            }
          ]
        },
        {
          "id": 7112,
          "pid": 71,
          "level": "city",
          "name": "基隆市",
          "children": [
            {
              "id": 711201,
              "pid": 7112,
              "level": "district",
              "name": "中正区"
            },
            {
              "id": 711202,
              "pid": 7112,
              "level": "district",
              "name": "七堵区"
            },
            {
              "id": 711203,
              "pid": 7112,
              "level": "district",
              "name": "暖暖区"
            },
            {
              "id": 711204,
              "pid": 7112,
              "level": "district",
              "name": "仁爱区"
            },
            {
              "id": 711205,
              "pid": 7112,
              "level": "district",
              "name": "中山区"
            },
            {
              "id": 711206,
              "pid": 7112,
              "level": "district",
              "name": "安乐区"
            },
            {
              "id": 711207,
              "pid": 7112,
              "level": "district",
              "name": "信义区"
            }
          ]
        },
        {
          "id": 7113,
          "pid": 71,
          "level": "city",
          "name": "台南市",
          "children": [
            {
              "id": 711301,
              "pid": 7113,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 711302,
              "pid": 7113,
              "level": "district",
              "name": "南区"
            },
            {
              "id": 711304,
              "pid": 7113,
              "level": "district",
              "name": "北区"
            },
            {
              "id": 711306,
              "pid": 7113,
              "level": "district",
              "name": "安南区"
            },
            {
              "id": 711307,
              "pid": 7113,
              "level": "district",
              "name": "安平区"
            },
            {
              "id": 711308,
              "pid": 7113,
              "level": "district",
              "name": "中西区"
            },
            {
              "id": 711341,
              "pid": 7113,
              "level": "district",
              "name": "新营区"
            },
            {
              "id": 711342,
              "pid": 7113,
              "level": "district",
              "name": "盐水区"
            },
            {
              "id": 711343,
              "pid": 7113,
              "level": "district",
              "name": "白河区"
            },
            {
              "id": 711344,
              "pid": 7113,
              "level": "district",
              "name": "柳营区"
            },
            {
              "id": 711345,
              "pid": 7113,
              "level": "district",
              "name": "后壁区"
            },
            {
              "id": 711346,
              "pid": 7113,
              "level": "district",
              "name": "东山区"
            },
            {
              "id": 711347,
              "pid": 7113,
              "level": "district",
              "name": "麻豆区"
            },
            {
              "id": 711348,
              "pid": 7113,
              "level": "district",
              "name": "下营区"
            },
            {
              "id": 711349,
              "pid": 7113,
              "level": "district",
              "name": "六甲区"
            },
            {
              "id": 711350,
              "pid": 7113,
              "level": "district",
              "name": "官田区"
            },
            {
              "id": 711351,
              "pid": 7113,
              "level": "district",
              "name": "大内区"
            },
            {
              "id": 711352,
              "pid": 7113,
              "level": "district",
              "name": "佳里区"
            },
            {
              "id": 711353,
              "pid": 7113,
              "level": "district",
              "name": "西港区"
            },
            {
              "id": 711354,
              "pid": 7113,
              "level": "district",
              "name": "七股区"
            },
            {
              "id": 711355,
              "pid": 7113,
              "level": "district",
              "name": "将军区"
            },
            {
              "id": 711356,
              "pid": 7113,
              "level": "district",
              "name": "北门区"
            },
            {
              "id": 711357,
              "pid": 7113,
              "level": "district",
              "name": "学甲区"
            },
            {
              "id": 711358,
              "pid": 7113,
              "level": "district",
              "name": "新化区"
            },
            {
              "id": 711359,
              "pid": 7113,
              "level": "district",
              "name": "善化区"
            },
            {
              "id": 711360,
              "pid": 7113,
              "level": "district",
              "name": "新市区"
            },
            {
              "id": 711361,
              "pid": 7113,
              "level": "district",
              "name": "安定区"
            },
            {
              "id": 711362,
              "pid": 7113,
              "level": "district",
              "name": "山上区"
            },
            {
              "id": 711363,
              "pid": 7113,
              "level": "district",
              "name": "玉井区"
            },
            {
              "id": 711364,
              "pid": 7113,
              "level": "district",
              "name": "楠西区"
            },
            {
              "id": 711365,
              "pid": 7113,
              "level": "district",
              "name": "南化区"
            },
            {
              "id": 711366,
              "pid": 7113,
              "level": "district",
              "name": "左镇区"
            },
            {
              "id": 711367,
              "pid": 7113,
              "level": "district",
              "name": "仁德区"
            },
            {
              "id": 711368,
              "pid": 7113,
              "level": "district",
              "name": "归仁区"
            },
            {
              "id": 711369,
              "pid": 7113,
              "level": "district",
              "name": "关庙区"
            },
            {
              "id": 711370,
              "pid": 7113,
              "level": "district",
              "name": "龙崎区"
            },
            {
              "id": 711371,
              "pid": 7113,
              "level": "district",
              "name": "永康区"
            }
          ]
        },
        {
          "id": 7114,
          "pid": 71,
          "level": "city",
          "name": "高雄市",
          "children": [
            {
              "id": 711401,
              "pid": 7114,
              "level": "district",
              "name": "盐埕区"
            },
            {
              "id": 711402,
              "pid": 7114,
              "level": "district",
              "name": "鼓山区"
            },
            {
              "id": 711403,
              "pid": 7114,
              "level": "district",
              "name": "左营区"
            },
            {
              "id": 711404,
              "pid": 7114,
              "level": "district",
              "name": "楠梓区"
            },
            {
              "id": 711405,
              "pid": 7114,
              "level": "district",
              "name": "三民区"
            },
            {
              "id": 711406,
              "pid": 7114,
              "level": "district",
              "name": "新兴区"
            },
            {
              "id": 711407,
              "pid": 7114,
              "level": "district",
              "name": "前金区"
            },
            {
              "id": 711408,
              "pid": 7114,
              "level": "district",
              "name": "苓雅区"
            },
            {
              "id": 711409,
              "pid": 7114,
              "level": "district",
              "name": "前镇区"
            },
            {
              "id": 711410,
              "pid": 7114,
              "level": "district",
              "name": "旗津区"
            },
            {
              "id": 711411,
              "pid": 7114,
              "level": "district",
              "name": "小港区"
            },
            {
              "id": 711441,
              "pid": 7114,
              "level": "district",
              "name": "凤山区"
            },
            {
              "id": 711442,
              "pid": 7114,
              "level": "district",
              "name": "鸟松区"
            },
            {
              "id": 711443,
              "pid": 7114,
              "level": "district",
              "name": "仁武区"
            },
            {
              "id": 711444,
              "pid": 7114,
              "level": "district",
              "name": "大社区"
            },
            {
              "id": 711445,
              "pid": 7114,
              "level": "district",
              "name": "大树区"
            },
            {
              "id": 711446,
              "pid": 7114,
              "level": "district",
              "name": "大寮区"
            },
            {
              "id": 711448,
              "pid": 7114,
              "level": "district",
              "name": "林园区"
            },
            {
              "id": 711449,
              "pid": 7114,
              "level": "district",
              "name": "冈山区"
            },
            {
              "id": 711450,
              "pid": 7114,
              "level": "district",
              "name": "茄萣区"
            },
            {
              "id": 711451,
              "pid": 7114,
              "level": "district",
              "name": "永安区"
            },
            {
              "id": 711452,
              "pid": 7114,
              "level": "district",
              "name": "桥头区"
            },
            {
              "id": 711453,
              "pid": 7114,
              "level": "district",
              "name": "梓官区"
            },
            {
              "id": 711454,
              "pid": 7114,
              "level": "district",
              "name": "田寮区"
            },
            {
              "id": 711455,
              "pid": 7114,
              "level": "district",
              "name": "阿莲区"
            },
            {
              "id": 711456,
              "pid": 7114,
              "level": "district",
              "name": "路竹区"
            },
            {
              "id": 711457,
              "pid": 7114,
              "level": "district",
              "name": "燕巢区"
            },
            {
              "id": 711458,
              "pid": 7114,
              "level": "district",
              "name": "弥陀区"
            },
            {
              "id": 711459,
              "pid": 7114,
              "level": "district",
              "name": "湖内区"
            },
            {
              "id": 711460,
              "pid": 7114,
              "level": "district",
              "name": "旗山区"
            },
            {
              "id": 711461,
              "pid": 7114,
              "level": "district",
              "name": "六龟区"
            },
            {
              "id": 711462,
              "pid": 7114,
              "level": "district",
              "name": "内门区"
            },
            {
              "id": 711463,
              "pid": 7114,
              "level": "district",
              "name": "美浓区"
            },
            {
              "id": 711464,
              "pid": 7114,
              "level": "district",
              "name": "杉林区"
            },
            {
              "id": 711465,
              "pid": 7114,
              "level": "district",
              "name": "甲仙区"
            },
            {
              "id": 711466,
              "pid": 7114,
              "level": "district",
              "name": "茂林区"
            },
            {
              "id": 711467,
              "pid": 7114,
              "level": "district",
              "name": "桃源区"
            },
            {
              "id": 711468,
              "pid": 7114,
              "level": "district",
              "name": "那玛夏区"
            }
          ]
        },
        {
          "id": 7115,
          "pid": 71,
          "level": "city",
          "name": "新北市",
          "children": [
            {
              "id": 711501,
              "pid": 7115,
              "level": "district",
              "name": "新庄区"
            },
            {
              "id": 711502,
              "pid": 7115,
              "level": "district",
              "name": "林口区"
            },
            {
              "id": 711503,
              "pid": 7115,
              "level": "district",
              "name": "五股区"
            },
            {
              "id": 711504,
              "pid": 7115,
              "level": "district",
              "name": "芦洲区"
            },
            {
              "id": 711505,
              "pid": 7115,
              "level": "district",
              "name": "三重区"
            },
            {
              "id": 711506,
              "pid": 7115,
              "level": "district",
              "name": "泰山区"
            },
            {
              "id": 711507,
              "pid": 7115,
              "level": "district",
              "name": "新店区"
            },
            {
              "id": 711508,
              "pid": 7115,
              "level": "district",
              "name": "石碇区"
            },
            {
              "id": 711509,
              "pid": 7115,
              "level": "district",
              "name": "深坑区"
            },
            {
              "id": 711510,
              "pid": 7115,
              "level": "district",
              "name": "坪林区"
            },
            {
              "id": 711511,
              "pid": 7115,
              "level": "district",
              "name": "乌来区"
            },
            {
              "id": 711514,
              "pid": 7115,
              "level": "district",
              "name": "板桥区"
            },
            {
              "id": 711515,
              "pid": 7115,
              "level": "district",
              "name": "三峡区"
            },
            {
              "id": 711516,
              "pid": 7115,
              "level": "district",
              "name": "莺歌区"
            },
            {
              "id": 711517,
              "pid": 7115,
              "level": "district",
              "name": "树林区"
            },
            {
              "id": 711518,
              "pid": 7115,
              "level": "district",
              "name": "中和区"
            },
            {
              "id": 711519,
              "pid": 7115,
              "level": "district",
              "name": "土城区"
            },
            {
              "id": 711521,
              "pid": 7115,
              "level": "district",
              "name": "瑞芳区"
            },
            {
              "id": 711522,
              "pid": 7115,
              "level": "district",
              "name": "平溪区"
            },
            {
              "id": 711523,
              "pid": 7115,
              "level": "district",
              "name": "双溪区"
            },
            {
              "id": 711524,
              "pid": 7115,
              "level": "district",
              "name": "贡寮区"
            },
            {
              "id": 711525,
              "pid": 7115,
              "level": "district",
              "name": "金山区"
            },
            {
              "id": 711526,
              "pid": 7115,
              "level": "district",
              "name": "万里区"
            },
            {
              "id": 711527,
              "pid": 7115,
              "level": "district",
              "name": "淡水区"
            },
            {
              "id": 711528,
              "pid": 7115,
              "level": "district",
              "name": "汐止区"
            },
            {
              "id": 711530,
              "pid": 7115,
              "level": "district",
              "name": "三芝区"
            },
            {
              "id": 711531,
              "pid": 7115,
              "level": "district",
              "name": "石门区"
            },
            {
              "id": 711532,
              "pid": 7115,
              "level": "district",
              "name": "八里区"
            },
            {
              "id": 711533,
              "pid": 7115,
              "level": "district",
              "name": "永和区"
            }
          ]
        },
        {
          "id": 7116,
          "pid": 71,
          "level": "city",
          "name": "宜兰县",
          "children": [
            {
              "id": 711601,
              "pid": 7116,
              "level": "district",
              "name": "宜兰市"
            },
            {
              "id": 711602,
              "pid": 7116,
              "level": "district",
              "name": "头城镇"
            },
            {
              "id": 711603,
              "pid": 7116,
              "level": "district",
              "name": "礁溪乡"
            },
            {
              "id": 711604,
              "pid": 7116,
              "level": "district",
              "name": "壮围乡"
            },
            {
              "id": 711605,
              "pid": 7116,
              "level": "district",
              "name": "员山乡"
            },
            {
              "id": 711606,
              "pid": 7116,
              "level": "district",
              "name": "罗东镇"
            },
            {
              "id": 711607,
              "pid": 7116,
              "level": "district",
              "name": "五结乡"
            },
            {
              "id": 711608,
              "pid": 7116,
              "level": "district",
              "name": "冬山乡"
            },
            {
              "id": 711609,
              "pid": 7116,
              "level": "district",
              "name": "苏澳镇"
            },
            {
              "id": 711610,
              "pid": 7116,
              "level": "district",
              "name": "三星乡"
            },
            {
              "id": 711611,
              "pid": 7116,
              "level": "district",
              "name": "大同乡"
            },
            {
              "id": 711612,
              "pid": 7116,
              "level": "district",
              "name": "南澳乡"
            }
          ]
        },
        {
          "id": 7117,
          "pid": 71,
          "level": "city",
          "name": "桃园市",
          "children": [
            {
              "id": 711701,
              "pid": 7117,
              "level": "district",
              "name": "桃园区"
            },
            {
              "id": 711702,
              "pid": 7117,
              "level": "district",
              "name": "大溪区"
            },
            {
              "id": 711703,
              "pid": 7117,
              "level": "district",
              "name": "中坜区"
            },
            {
              "id": 711704,
              "pid": 7117,
              "level": "district",
              "name": "杨梅区"
            },
            {
              "id": 711705,
              "pid": 7117,
              "level": "district",
              "name": "芦竹区"
            },
            {
              "id": 711706,
              "pid": 7117,
              "level": "district",
              "name": "大园区"
            },
            {
              "id": 711707,
              "pid": 7117,
              "level": "district",
              "name": "龟山区"
            },
            {
              "id": 711708,
              "pid": 7117,
              "level": "district",
              "name": "八德区"
            },
            {
              "id": 711709,
              "pid": 7117,
              "level": "district",
              "name": "龙潭区"
            },
            {
              "id": 711710,
              "pid": 7117,
              "level": "district",
              "name": "平镇区"
            },
            {
              "id": 711711,
              "pid": 7117,
              "level": "district",
              "name": "新屋区"
            },
            {
              "id": 711712,
              "pid": 7117,
              "level": "district",
              "name": "观音区"
            },
            {
              "id": 711713,
              "pid": 7117,
              "level": "district",
              "name": "复兴区"
            }
          ]
        },
        {
          "id": 7118,
          "pid": 71,
          "level": "city",
          "name": "嘉义市",
          "children": [
            {
              "id": 711801,
              "pid": 7118,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 711802,
              "pid": 7118,
              "level": "district",
              "name": "西区"
            }
          ]
        },
        {
          "id": 7119,
          "pid": 71,
          "level": "city",
          "name": "新竹县",
          "children": [
            {
              "id": 711902,
              "pid": 7119,
              "level": "district",
              "name": "竹东镇"
            },
            {
              "id": 711903,
              "pid": 7119,
              "level": "district",
              "name": "关西镇"
            },
            {
              "id": 711904,
              "pid": 7119,
              "level": "district",
              "name": "新埔镇"
            },
            {
              "id": 711905,
              "pid": 7119,
              "level": "district",
              "name": "竹北市"
            },
            {
              "id": 711906,
              "pid": 7119,
              "level": "district",
              "name": "湖口乡"
            },
            {
              "id": 711908,
              "pid": 7119,
              "level": "district",
              "name": "横山乡"
            },
            {
              "id": 711909,
              "pid": 7119,
              "level": "district",
              "name": "新丰乡"
            },
            {
              "id": 711910,
              "pid": 7119,
              "level": "district",
              "name": "芎林乡"
            },
            {
              "id": 711911,
              "pid": 7119,
              "level": "district",
              "name": "宝山乡"
            },
            {
              "id": 711912,
              "pid": 7119,
              "level": "district",
              "name": "北埔乡"
            },
            {
              "id": 711913,
              "pid": 7119,
              "level": "district",
              "name": "峨眉乡"
            },
            {
              "id": 711914,
              "pid": 7119,
              "level": "district",
              "name": "尖石乡"
            },
            {
              "id": 711915,
              "pid": 7119,
              "level": "district",
              "name": "五峰乡"
            }
          ]
        },
        {
          "id": 7120,
          "pid": 71,
          "level": "city",
          "name": "苗栗县",
          "children": [
            {
              "id": 712001,
              "pid": 7120,
              "level": "district",
              "name": "苗栗市"
            },
            {
              "id": 712002,
              "pid": 7120,
              "level": "district",
              "name": "苑里镇"
            },
            {
              "id": 712003,
              "pid": 7120,
              "level": "district",
              "name": "通霄镇"
            },
            {
              "id": 712004,
              "pid": 7120,
              "level": "district",
              "name": "公馆乡"
            },
            {
              "id": 712005,
              "pid": 7120,
              "level": "district",
              "name": "铜锣乡"
            },
            {
              "id": 712006,
              "pid": 7120,
              "level": "district",
              "name": "三义乡"
            },
            {
              "id": 712007,
              "pid": 7120,
              "level": "district",
              "name": "西湖乡"
            },
            {
              "id": 712008,
              "pid": 7120,
              "level": "district",
              "name": "头屋乡"
            },
            {
              "id": 712009,
              "pid": 7120,
              "level": "district",
              "name": "竹南镇"
            },
            {
              "id": 712010,
              "pid": 7120,
              "level": "district",
              "name": "头份市"
            },
            {
              "id": 712011,
              "pid": 7120,
              "level": "district",
              "name": "造桥乡"
            },
            {
              "id": 712012,
              "pid": 7120,
              "level": "district",
              "name": "后龙镇"
            },
            {
              "id": 712013,
              "pid": 7120,
              "level": "district",
              "name": "三湾乡"
            },
            {
              "id": 712014,
              "pid": 7120,
              "level": "district",
              "name": "南庄乡"
            },
            {
              "id": 712015,
              "pid": 7120,
              "level": "district",
              "name": "大湖乡"
            },
            {
              "id": 712016,
              "pid": 7120,
              "level": "district",
              "name": "卓兰镇"
            },
            {
              "id": 712017,
              "pid": 7120,
              "level": "district",
              "name": "狮潭乡"
            },
            {
              "id": 712018,
              "pid": 7120,
              "level": "district",
              "name": "泰安乡"
            }
          ]
        },
        {
          "id": 7122,
          "pid": 71,
          "level": "city",
          "name": "南投县",
          "children": [
            {
              "id": 712201,
              "pid": 7122,
              "level": "district",
              "name": "南投市"
            },
            {
              "id": 712202,
              "pid": 7122,
              "level": "district",
              "name": "埔里镇"
            },
            {
              "id": 712203,
              "pid": 7122,
              "level": "district",
              "name": "草屯镇"
            },
            {
              "id": 712204,
              "pid": 7122,
              "level": "district",
              "name": "竹山镇"
            },
            {
              "id": 712205,
              "pid": 7122,
              "level": "district",
              "name": "集集镇"
            },
            {
              "id": 712206,
              "pid": 7122,
              "level": "district",
              "name": "名间乡"
            },
            {
              "id": 712207,
              "pid": 7122,
              "level": "district",
              "name": "鹿谷乡"
            },
            {
              "id": 712208,
              "pid": 7122,
              "level": "district",
              "name": "中寮乡"
            },
            {
              "id": 712209,
              "pid": 7122,
              "level": "district",
              "name": "鱼池乡"
            },
            {
              "id": 712210,
              "pid": 7122,
              "level": "district",
              "name": "国姓乡"
            },
            {
              "id": 712211,
              "pid": 7122,
              "level": "district",
              "name": "水里乡"
            },
            {
              "id": 712212,
              "pid": 7122,
              "level": "district",
              "name": "信义乡"
            },
            {
              "id": 712213,
              "pid": 7122,
              "level": "district",
              "name": "仁爱乡"
            }
          ]
        },
        {
          "id": 7123,
          "pid": 71,
          "level": "city",
          "name": "彰化县",
          "children": [
            {
              "id": 712301,
              "pid": 7123,
              "level": "district",
              "name": "彰化市"
            },
            {
              "id": 712302,
              "pid": 7123,
              "level": "district",
              "name": "鹿港镇"
            },
            {
              "id": 712303,
              "pid": 7123,
              "level": "district",
              "name": "和美镇"
            },
            {
              "id": 712304,
              "pid": 7123,
              "level": "district",
              "name": "北斗镇"
            },
            {
              "id": 712305,
              "pid": 7123,
              "level": "district",
              "name": "员林市"
            },
            {
              "id": 712306,
              "pid": 7123,
              "level": "district",
              "name": "溪湖镇"
            },
            {
              "id": 712307,
              "pid": 7123,
              "level": "district",
              "name": "田中镇"
            },
            {
              "id": 712308,
              "pid": 7123,
              "level": "district",
              "name": "二林镇"
            },
            {
              "id": 712309,
              "pid": 7123,
              "level": "district",
              "name": "线西乡"
            },
            {
              "id": 712310,
              "pid": 7123,
              "level": "district",
              "name": "伸港乡"
            },
            {
              "id": 712311,
              "pid": 7123,
              "level": "district",
              "name": "福兴乡"
            },
            {
              "id": 712312,
              "pid": 7123,
              "level": "district",
              "name": "秀水乡"
            },
            {
              "id": 712313,
              "pid": 7123,
              "level": "district",
              "name": "花坛乡"
            },
            {
              "id": 712314,
              "pid": 7123,
              "level": "district",
              "name": "芬园乡"
            },
            {
              "id": 712315,
              "pid": 7123,
              "level": "district",
              "name": "大村乡"
            },
            {
              "id": 712316,
              "pid": 7123,
              "level": "district",
              "name": "埔盐乡"
            },
            {
              "id": 712317,
              "pid": 7123,
              "level": "district",
              "name": "埔心乡"
            },
            {
              "id": 712318,
              "pid": 7123,
              "level": "district",
              "name": "永靖乡"
            },
            {
              "id": 712319,
              "pid": 7123,
              "level": "district",
              "name": "社头乡"
            },
            {
              "id": 712320,
              "pid": 7123,
              "level": "district",
              "name": "二水乡"
            },
            {
              "id": 712321,
              "pid": 7123,
              "level": "district",
              "name": "田尾乡"
            },
            {
              "id": 712322,
              "pid": 7123,
              "level": "district",
              "name": "埤头乡"
            },
            {
              "id": 712323,
              "pid": 7123,
              "level": "district",
              "name": "芳苑乡"
            },
            {
              "id": 712324,
              "pid": 7123,
              "level": "district",
              "name": "大城乡"
            },
            {
              "id": 712325,
              "pid": 7123,
              "level": "district",
              "name": "竹塘乡"
            },
            {
              "id": 712326,
              "pid": 7123,
              "level": "district",
              "name": "溪州乡"
            }
          ]
        },
        {
          "id": 7124,
          "pid": 71,
          "level": "city",
          "name": "新竹市",
          "children": [
            {
              "id": 712401,
              "pid": 7124,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 712402,
              "pid": 7124,
              "level": "district",
              "name": "香山区"
            },
            {
              "id": 712403,
              "pid": 7124,
              "level": "district",
              "name": "北区"
            }
          ]
        },
        {
          "id": 7125,
          "pid": 71,
          "level": "city",
          "name": "云林县",
          "children": [
            {
              "id": 712501,
              "pid": 7125,
              "level": "district",
              "name": "斗六市"
            },
            {
              "id": 712502,
              "pid": 7125,
              "level": "district",
              "name": "斗南镇"
            },
            {
              "id": 712503,
              "pid": 7125,
              "level": "district",
              "name": "虎尾镇"
            },
            {
              "id": 712504,
              "pid": 7125,
              "level": "district",
              "name": "西螺镇"
            },
            {
              "id": 712505,
              "pid": 7125,
              "level": "district",
              "name": "土库镇"
            },
            {
              "id": 712506,
              "pid": 7125,
              "level": "district",
              "name": "北港镇"
            },
            {
              "id": 712507,
              "pid": 7125,
              "level": "district",
              "name": "古坑乡"
            },
            {
              "id": 712508,
              "pid": 7125,
              "level": "district",
              "name": "大埤乡"
            },
            {
              "id": 712509,
              "pid": 7125,
              "level": "district",
              "name": "莿桐乡"
            },
            {
              "id": 712510,
              "pid": 7125,
              "level": "district",
              "name": "林内乡"
            },
            {
              "id": 712511,
              "pid": 7125,
              "level": "district",
              "name": "二仑乡"
            },
            {
              "id": 712512,
              "pid": 7125,
              "level": "district",
              "name": "仑背乡"
            },
            {
              "id": 712513,
              "pid": 7125,
              "level": "district",
              "name": "麦寮乡"
            },
            {
              "id": 712514,
              "pid": 7125,
              "level": "district",
              "name": "东势乡"
            },
            {
              "id": 712515,
              "pid": 7125,
              "level": "district",
              "name": "褒忠乡"
            },
            {
              "id": 712516,
              "pid": 7125,
              "level": "district",
              "name": "台西乡"
            },
            {
              "id": 712517,
              "pid": 7125,
              "level": "district",
              "name": "元长乡"
            },
            {
              "id": 712518,
              "pid": 7125,
              "level": "district",
              "name": "四湖乡"
            },
            {
              "id": 712519,
              "pid": 7125,
              "level": "district",
              "name": "口湖乡"
            },
            {
              "id": 712520,
              "pid": 7125,
              "level": "district",
              "name": "水林乡"
            }
          ]
        },
        {
          "id": 7126,
          "pid": 71,
          "level": "city",
          "name": "嘉义县",
          "children": [
            {
              "id": 712602,
              "pid": 7126,
              "level": "district",
              "name": "朴子市"
            },
            {
              "id": 712603,
              "pid": 7126,
              "level": "district",
              "name": "布袋镇"
            },
            {
              "id": 712604,
              "pid": 7126,
              "level": "district",
              "name": "大林镇"
            },
            {
              "id": 712605,
              "pid": 7126,
              "level": "district",
              "name": "民雄乡"
            },
            {
              "id": 712606,
              "pid": 7126,
              "level": "district",
              "name": "溪口乡"
            },
            {
              "id": 712607,
              "pid": 7126,
              "level": "district",
              "name": "新港乡"
            },
            {
              "id": 712608,
              "pid": 7126,
              "level": "district",
              "name": "六脚乡"
            },
            {
              "id": 712609,
              "pid": 7126,
              "level": "district",
              "name": "东石乡"
            },
            {
              "id": 712610,
              "pid": 7126,
              "level": "district",
              "name": "义竹乡"
            },
            {
              "id": 712611,
              "pid": 7126,
              "level": "district",
              "name": "鹿草乡"
            },
            {
              "id": 712612,
              "pid": 7126,
              "level": "district",
              "name": "太保市"
            },
            {
              "id": 712613,
              "pid": 7126,
              "level": "district",
              "name": "水上乡"
            },
            {
              "id": 712614,
              "pid": 7126,
              "level": "district",
              "name": "中埔乡"
            },
            {
              "id": 712615,
              "pid": 7126,
              "level": "district",
              "name": "竹崎乡"
            },
            {
              "id": 712616,
              "pid": 7126,
              "level": "district",
              "name": "梅山乡"
            },
            {
              "id": 712617,
              "pid": 7126,
              "level": "district",
              "name": "番路乡"
            },
            {
              "id": 712618,
              "pid": 7126,
              "level": "district",
              "name": "大埔乡"
            },
            {
              "id": 712620,
              "pid": 7126,
              "level": "district",
              "name": "阿里山乡"
            }
          ]
        },
        {
          "id": 7129,
          "pid": 71,
          "level": "city",
          "name": "屏东县",
          "children": [
            {
              "id": 712901,
              "pid": 7129,
              "level": "district",
              "name": "屏东市"
            },
            {
              "id": 712902,
              "pid": 7129,
              "level": "district",
              "name": "潮州镇"
            },
            {
              "id": 712903,
              "pid": 7129,
              "level": "district",
              "name": "东港镇"
            },
            {
              "id": 712904,
              "pid": 7129,
              "level": "district",
              "name": "恒春镇"
            },
            {
              "id": 712905,
              "pid": 7129,
              "level": "district",
              "name": "万丹乡"
            },
            {
              "id": 712906,
              "pid": 7129,
              "level": "district",
              "name": "长治乡"
            },
            {
              "id": 712907,
              "pid": 7129,
              "level": "district",
              "name": "麟洛乡"
            },
            {
              "id": 712908,
              "pid": 7129,
              "level": "district",
              "name": "九如乡"
            },
            {
              "id": 712909,
              "pid": 7129,
              "level": "district",
              "name": "里港乡"
            },
            {
              "id": 712910,
              "pid": 7129,
              "level": "district",
              "name": "盐埔乡"
            },
            {
              "id": 712911,
              "pid": 7129,
              "level": "district",
              "name": "高树乡"
            },
            {
              "id": 712912,
              "pid": 7129,
              "level": "district",
              "name": "万峦乡"
            },
            {
              "id": 712913,
              "pid": 7129,
              "level": "district",
              "name": "内埔乡"
            },
            {
              "id": 712914,
              "pid": 7129,
              "level": "district",
              "name": "竹田乡"
            },
            {
              "id": 712915,
              "pid": 7129,
              "level": "district",
              "name": "新埤乡"
            },
            {
              "id": 712916,
              "pid": 7129,
              "level": "district",
              "name": "枋寮乡"
            },
            {
              "id": 712917,
              "pid": 7129,
              "level": "district",
              "name": "新园乡"
            },
            {
              "id": 712918,
              "pid": 7129,
              "level": "district",
              "name": "崁顶乡"
            },
            {
              "id": 712919,
              "pid": 7129,
              "level": "district",
              "name": "林边乡"
            },
            {
              "id": 712920,
              "pid": 7129,
              "level": "district",
              "name": "南州乡"
            },
            {
              "id": 712921,
              "pid": 7129,
              "level": "district",
              "name": "佳冬乡"
            },
            {
              "id": 712922,
              "pid": 7129,
              "level": "district",
              "name": "琉球乡"
            },
            {
              "id": 712923,
              "pid": 7129,
              "level": "district",
              "name": "车城乡"
            },
            {
              "id": 712924,
              "pid": 7129,
              "level": "district",
              "name": "满州乡"
            },
            {
              "id": 712925,
              "pid": 7129,
              "level": "district",
              "name": "枋山乡"
            },
            {
              "id": 712926,
              "pid": 7129,
              "level": "district",
              "name": "三地门乡"
            },
            {
              "id": 712927,
              "pid": 7129,
              "level": "district",
              "name": "雾台乡"
            },
            {
              "id": 712928,
              "pid": 7129,
              "level": "district",
              "name": "玛家乡"
            },
            {
              "id": 712929,
              "pid": 7129,
              "level": "district",
              "name": "泰武乡"
            },
            {
              "id": 712930,
              "pid": 7129,
              "level": "district",
              "name": "来义乡"
            },
            {
              "id": 712931,
              "pid": 7129,
              "level": "district",
              "name": "春日乡"
            },
            {
              "id": 712932,
              "pid": 7129,
              "level": "district",
              "name": "狮子乡"
            },
            {
              "id": 712933,
              "pid": 7129,
              "level": "district",
              "name": "牡丹乡"
            }
          ]
        },
        {
          "id": 7130,
          "pid": 71,
          "level": "city",
          "name": "花莲县",
          "children": [
            {
              "id": 713001,
              "pid": 7130,
              "level": "district",
              "name": "花莲市"
            },
            {
              "id": 713002,
              "pid": 7130,
              "level": "district",
              "name": "光复乡"
            },
            {
              "id": 713003,
              "pid": 7130,
              "level": "district",
              "name": "玉里镇"
            },
            {
              "id": 713004,
              "pid": 7130,
              "level": "district",
              "name": "新城乡"
            },
            {
              "id": 713005,
              "pid": 7130,
              "level": "district",
              "name": "吉安乡"
            },
            {
              "id": 713006,
              "pid": 7130,
              "level": "district",
              "name": "寿丰乡"
            },
            {
              "id": 713007,
              "pid": 7130,
              "level": "district",
              "name": "凤林镇"
            },
            {
              "id": 713008,
              "pid": 7130,
              "level": "district",
              "name": "丰滨乡"
            },
            {
              "id": 713009,
              "pid": 7130,
              "level": "district",
              "name": "瑞穗乡"
            },
            {
              "id": 713010,
              "pid": 7130,
              "level": "district",
              "name": "富里乡"
            },
            {
              "id": 713011,
              "pid": 7130,
              "level": "district",
              "name": "卓溪乡"
            },
            {
              "id": 713012,
              "pid": 7130,
              "level": "district",
              "name": "万荣乡"
            },
            {
              "id": 713013,
              "pid": 7130,
              "level": "district",
              "name": "秀林乡"
            }
          ]
        },
        {
          "id": 7131,
          "pid": 71,
          "level": "city",
          "name": "台东县",
          "children": [
            {
              "id": 713101,
              "pid": 7131,
              "level": "district",
              "name": "台东市"
            },
            {
              "id": 713102,
              "pid": 7131,
              "level": "district",
              "name": "成功镇"
            },
            {
              "id": 713103,
              "pid": 7131,
              "level": "district",
              "name": "关山镇"
            },
            {
              "id": 713104,
              "pid": 7131,
              "level": "district",
              "name": "卑南乡"
            },
            {
              "id": 713105,
              "pid": 7131,
              "level": "district",
              "name": "大武乡"
            },
            {
              "id": 713106,
              "pid": 7131,
              "level": "district",
              "name": "太麻里乡"
            },
            {
              "id": 713107,
              "pid": 7131,
              "level": "district",
              "name": "东河乡"
            },
            {
              "id": 713108,
              "pid": 7131,
              "level": "district",
              "name": "长滨乡"
            },
            {
              "id": 713109,
              "pid": 7131,
              "level": "district",
              "name": "鹿野乡"
            },
            {
              "id": 713110,
              "pid": 7131,
              "level": "district",
              "name": "池上乡"
            },
            {
              "id": 713111,
              "pid": 7131,
              "level": "district",
              "name": "绿岛乡"
            },
            {
              "id": 713112,
              "pid": 7131,
              "level": "district",
              "name": "延平乡"
            },
            {
              "id": 713113,
              "pid": 7131,
              "level": "district",
              "name": "海端乡"
            },
            {
              "id": 713114,
              "pid": 7131,
              "level": "district",
              "name": "达仁乡"
            },
            {
              "id": 713115,
              "pid": 7131,
              "level": "district",
              "name": "金峰乡"
            },
            {
              "id": 713116,
              "pid": 7131,
              "level": "district",
              "name": "兰屿乡"
            }
          ]
        },
        {
          "id": 7132,
          "pid": 71,
          "level": "city",
          "name": "澎湖县",
          "children": [
            {
              "id": 713201,
              "pid": 7132,
              "level": "district",
              "name": "马公市"
            },
            {
              "id": 713202,
              "pid": 7132,
              "level": "district",
              "name": "湖西乡"
            },
            {
              "id": 713203,
              "pid": 7132,
              "level": "district",
              "name": "白沙乡"
            },
            {
              "id": 713204,
              "pid": 7132,
              "level": "district",
              "name": "西屿乡"
            },
            {
              "id": 713205,
              "pid": 7132,
              "level": "district",
              "name": "望安乡"
            },
            {
              "id": 713206,
              "pid": 7132,
              "level": "district",
              "name": "七美乡"
            }
          ]
        }
      ]
    },
    {
      "id": 81,
      "pid": 0,
      "level": "province",
      "name": "香港特别行政区",
      "children": [
        {
          "id": 8100,
          "pid": 81,
          "level": "city",
          "name": "香港",
          "children": [
            {
              "id": 8111,
              "pid": 8100,
              "level": "district",
              "name": "中西区"
            },
            {
              "id": 8112,
              "pid": 8100,
              "level": "district",
              "name": "湾仔区"
            },
            {
              "id": 8113,
              "pid": 8100,
              "level": "district",
              "name": "东区"
            },
            {
              "id": 8114,
              "pid": 8100,
              "level": "district",
              "name": "南区"
            },
            {
              "id": 8121,
              "pid": 8100,
              "level": "district",
              "name": "油尖旺区"
            },
            {
              "id": 8122,
              "pid": 8100,
              "level": "district",
              "name": "深水埗区"
            },
            {
              "id": 8123,
              "pid": 8100,
              "level": "district",
              "name": "九龙城区"
            },
            {
              "id": 8124,
              "pid": 8100,
              "level": "district",
              "name": "黄大仙区"
            },
            {
              "id": 8125,
              "pid": 8100,
              "level": "district",
              "name": "观塘区"
            },
            {
              "id": 8131,
              "pid": 8100,
              "level": "district",
              "name": "葵青区"
            },
            {
              "id": 8132,
              "pid": 8100,
              "level": "district",
              "name": "荃湾区"
            },
            {
              "id": 8133,
              "pid": 8100,
              "level": "district",
              "name": "屯门区"
            },
            {
              "id": 8134,
              "pid": 8100,
              "level": "district",
              "name": "元朗区"
            },
            {
              "id": 8135,
              "pid": 8100,
              "level": "district",
              "name": "北区"
            },
            {
              "id": 8136,
              "pid": 8100,
              "level": "district",
              "name": "大埔区"
            },
            {
              "id": 8137,
              "pid": 8100,
              "level": "district",
              "name": "沙田区"
            },
            {
              "id": 8138,
              "pid": 8100,
              "level": "district",
              "name": "西贡区"
            },
            {
              "id": 8139,
              "pid": 8100,
              "level": "district",
              "name": "离岛区"
            }
          ]
        }
      ]
    },
    {
      "id": 82,
      "pid": 0,
      "level": "province",
      "name": "澳门特别行政区",
      "children": [
        {
          "id": 8200,
          "pid": 82,
          "level": "city",
          "name": "澳门",
          "children": [
            {
              "id": 8201,
              "pid": 8200,
              "level": "district",
              "name": "澳门半岛"
            },
            {
              "id": 8202,
              "pid": 8200,
              "level": "district",
              "name": "氹仔岛"
            },
            {
              "id": 8203,
              "pid": 8200,
              "level": "district",
              "name": "路环岛"
            },
            {
              "id": 8204,
              "pid": 8200,
              "level": "district",
              "name": "路氹城"
            }
          ]
        }
      ]
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].pid | integer | 父级ID |
| data[].level | string | 等级 |
| data[].name | string | 名称 |
| data[].children | array | 下级 |
| data[].children[].id | integer | ID |
| data[].children[].pid | integer | 父级ID |
| data[].children[].level | string | 等级 |
| data[].children[].name | string | 名称 |
| data[].children[].children | array | 下级 |
| data[].children[].children[].id | integer | ID |
| data[].children[].children[].pid | integer | 父级ID |
| data[].children[].children[].level | string | 等级 |
| data[].children[].children[].name | string | 名称 |
