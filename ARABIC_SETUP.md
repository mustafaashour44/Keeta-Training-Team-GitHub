# تشغيل Keeta Training Team بالكامل على GitHub

هذه النسخة معدلة لتعمل على **GitHub Pages فقط** بدون Replit وبدون Neon وبدون Backend منفصل.

## ماذا تغير؟

- شكل وتصميم الواجهة بقي كما هو.
- تم إزالة اعتماد الموقع على Node API وPostgreSQL أثناء التشغيل.
- البيانات تحفظ داخل المتصفح باستخدام Local Storage.
- GitHub Actions يقوم ببناء الموقع ونشره تلقائياً.

## الرفع على نفس Repository

1. فك ضغط الملف.
2. افتح مجلد الـ Repository الحالي من GitHub Desktop عبر **Repository > Show in Explorer**.
3. لا تحذف مجلد `.git` المخفي.
4. احذف ملفات المشروع القديمة الموجودة داخل الـ Repository، ثم انسخ **محتويات** هذه النسخة الجديدة إلى نفس المجلد.
5. ارجع إلى GitHub Desktop.
6. اكتب Summary مثل: `Convert app to GitHub Pages`.
7. اضغط **Commit to main** ثم **Push origin**.

## تفعيل GitHub Pages مرة واحدة

1. افتح Repository على github.com.
2. ادخل **Settings > Pages**.
3. في **Build and deployment** اجعل **Source = GitHub Actions**.
4. ادخل تبويب **Actions** وانتظر نجاح Workflow باسم `Deploy Keeta Training Team to GitHub Pages`.
5. بعد النجاح افتح رابط الـ Deployment.

الرابط المتوقع إذا بقي اسم الـ Repository الحالي:

`https://mustafaashour44.github.io/Keeta-Training-Team-GitHub/`

## ملاحظة مهمة عن البيانات

بما أن GitHub Pages لا يشغل قاعدة بيانات أو Backend، فالبيانات بهذه النسخة تكون محفوظة في نفس المتصفح والجهاز الذي تستخدمه. فتح الرابط من جهاز/متصفح آخر سيبدأ ببيانات فارغة، ومسح Site Data من المتصفح يمسح البيانات.

هذه هي الطريقة الآمنة التي تحقق تشغيل الموقع بدون أي خدمة خارج GitHub وبدون وضع Password أو Token سري داخل كود الموقع.
