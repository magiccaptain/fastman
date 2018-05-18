import OpenApi3Spec, {OpenApi3} from "../spec/openapi-3";
import BaseRestfulTemplate from "./base-restful-template";
import path = require("path");
import fs =require("fs");


const specPath = path.join(__dirname, "..", "..", "example", "example_tested.yaml");

describe("Test template", function () {

	it("gen doc ", function () {
		const spec: OpenApi3Spec = new OpenApi3Spec();
		spec.info({
			title: "上海Bus数据Api",
			version: "0.0.1",
		});

		const vehicleModel: OpenApi3.SchemaObject = {
			type: "object",
			properties: {
				plate: {type: "string", description: "车牌"}, // 车牌
				position: {type: "object", description: "经纬度", properties: {lng: {type: "string"}, lat: {type: "string"}}}, // gps 坐标
				no: {type: "string", description: "自编号"}, // 自编号
				brands: {type: "string", description: "品牌"}, // 品牌
				company: {type: "string", description: "公司"}, // 公司
				convoy: {type: "string", description: "车队"}, // 车队
				line: {type: "string", description: "线路"}, // 线路
				type: {type: "string", description: "客车类型", example: "大型普通客车"}, // 客车类型 "大型普通客车"
				model: {type: "string", description: "车型"}, // 车型
				powerBy: {
					type: "string",
					enum: ["UNKNOWN", "FUEL", "HYBIRD", "ELECTRIC"],
					description: "动力",
				},
				emission: {
					// 排放标准 c1~c3 国标I 国标II 国标III
					type: "string",
					enum: ["UNKNOWN", "C1", "C2", "C3"],
					description: "排放标准",
				},
				capacity: {type: "integer", description: "额定载客人数"}, // 额定载客人数
				seats: {type: "integer", description: "座位数"}, // 座位数
				length: {type: "integer", description: "车辆长度"}, // 车辆长度
				photos: {type: "array", description: "照片", items: {type: "string"}},
				status: {
					type: "string",
					enum: ["UNKNOWN", "RUNNING", "BROKEN", "REPAIRING", "CHARGING"],
					description: "状态",
				},
				validTill: {type: "string", description: "报废日期"}, //
				purchaseAt: {type: "string", description: "购买日期"}, // 购买日期
				lastLoginAt: {type: "string", description: "上次登录时间"}, // 上一次登录系统时间
				deletedAt: {type: "string", description: "删除时间"}, // 删除时间
				modified: {type: "boolean", description: "是否改装"}, // 是否改装
				scrapped: {type: "boolean", description: "是否报废"}, // 是否报废
				deleted: {type: "boolean", description: "是否已经删除"}, // 是否已经删除
			},
		};

		const vehicleExample = {
			"plate": "沪D-85753",
			"no": "L0A-0004",
			"model": "SLK6109US55",
			"brands": "ford",
			"company": "巴士一公司",
			"convoy": "五车队",
			"line": "100",
			"type": "大型普通客车",
			"powerBy": "FUEL",
			"emission": "C3",
			"purchaseAt": "2008-01-01",
			"validTill": "2008-01-01",
			"capacity": 83,
			"seats": 30,
			"length": 10499,
			"photos": [],
			"modified": false,
			"scrapped": false,
		};

		const vehicleRestful = new BaseRestfulTemplate(
			"Vehicle",
			"车辆",
			spec,
			vehicleModel,
			vehicleExample,
		);

		vehicleRestful.genDoc();


		// console.log(spec.write());
		fs.writeFileSync(specPath, spec.write());

	});


});