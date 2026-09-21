const fs = require('fs');
const path = require('path');

function convertTsToJs(content) {
  // 移除 import type 语句
  content = content.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*\n?/g, '');

  // 移除 export type 语句
  content = content.replace(/export\s+type\s+[^=]*=\s*[^;]*;?\s*\n?/g, '');

  // 移除 type 别名
  content = content.replace(/type\s+\w+\s*=\s*[^;]*;?\s*\n?/g, '');

  // 移除函数参数中的类型注解 (param: Type)
  content = content.replace(/(\w+)\s*:\s*[A-Za-z_|&<>[\]{}'"`,\s]+(?=[,)\]:])/g, '$1');

  // 移除函数返回类型 (: ReturnType)
  content = content.replace(/\)\s*:\s*[A-Za-z_|&<>[\]{}'"`,\s]+(?=\s*\{)/g, ')');

  // 移除 as 类型断言
  content = content.replace(/\s+as\s+[A-Za-z_|&<>[\]{}'"`,\s]+/g, '');

  // 修复 validator 函数中的 TypeScript 语法
  content = content.replace(/validator\((\w+)\[.*?\]\)/g, 'validator($1)');

  // 移除 interface 声明
  content = content.replace(/export\s+interface\s+\w+\s*\{[^}]*\}/g, '');
  content = content.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');

  // 移除剩余的类型注解
  content = content.replace(/:\s*(Td|unknown|string|number|boolean|void|any|never|object|Array|Record|Promise|Function|Symbol|BigInt|Null|Undefined|Union|Intersection|Conditional|Mapped|Indexed|Infer|Keyof|Unique|Readonly|Partial|Required|Pick|Omit|Exclude|Extract|NonNullable|Parameters|ReturnType|InstanceType|ConstructorParameters|ThisType|Uppercase|Lowercase|Capitalize|Uncapitalize)/g, '');

  return content;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      const jsFile = filePath.replace(/\.ts$/, '.js');

      // 如果 .js 文件已存在，覆盖
      // if (fs.existsSync(jsFile)) {
      //   return;
      // }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const converted = convertTsToJs(content);
        fs.writeFileSync(jsFile, converted, 'utf8');
        console.log(`Converted: ${filePath} -> ${jsFile}`);
      } catch (err) {
        console.error(`Error converting ${filePath}:`, err.message);
      }
    }
  });
}

// 处理 TDesign 目录
const tdesignDir = path.join(__dirname, 'node_modules/@tdesign/uniapp/dist');
if (fs.existsSync(tdesignDir)) {
  console.log('Converting TypeScript files in TDesign...');
  processDirectory(tdesignDir);
  console.log('Done!');
} else {
  console.log('TDesign directory not found');
}
