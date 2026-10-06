// The standard Hebrew (SI-1452) layout: English key -> the Hebrew character on the same key.

export const TABLE: Record<string, string> = {
  q: '/', w: "'", e: 'ק', r: 'ר', t: 'א', y: 'ט', u: 'ו', i: 'ן', o: 'ם', p: 'פ',
  a: 'ש', s: 'ד', d: 'ג', f: 'כ', g: 'ע', h: 'י', j: 'ח', k: 'ל', l: 'ך', ';': 'ף', "'": ',',
  z: 'ז', x: 'ס', c: 'ב', v: 'ה', b: 'נ', n: 'מ', m: 'צ', ',': 'ת', '.': 'ץ', '/': '.',
}

export const HEBREW_LETTER = /[א-ת]/

// A real Hebrew word has final forms only at its end, and their regular forms never there.
export const isValidHebrew = (word: string) => {
  const letters = word.replace(/[^א-ת]/g, '')
  return !/[ךםןףץ](?=.)/.test(letters) && !(letters.length > 1 && /[כמנפצ]$/.test(letters))
}

// Letters a Hebrew word may carry in front (ו, ה, ב...), stripped before a lookup.
export const PREFIXES = 'ובהלמשכ'

const words = (list: string) => new Set(list.trim().split(/\s+/))

export const HEBREW = words(`
  של את על עם זה זו זאת לא כן גם אני אתה הוא היא אנחנו הם הן מה מי איך למה כי אם או אבל רק
  כל יש אין היה הייתה להיות עוד כבר אז פה שם כמו לי לך לו לה לנו להם אותו אותה אותי שלי שלך
  שלו שלה שלנו טוב רע תודה בבקשה שלום היי נשמע בסדר אוקיי עכשיו היום מחר אתמול יותר פחות מאוד
  הרבה קצת צריך צריכה רוצה יכול יכולה אפשר תעשה תעשי תקן תוסיף תמחק תבדוק תכתוב תסביר תראה קוד
  קובץ באג שגיאה בעיה כפתור דף עמוד אתר משהו כמה איפה מתי לפני אחרי בין תוך אחד אחת שני שתי חדש
  ישן גדול קטן נכון ככה כך האלה אלה עדיין אולי בטח ממש סתם בוא תן תני עובד עובדת לעבוד עשה עשית
  עשיתי הזה הזאת שאני שזה אותך איתי איתך בדיוק בכלל לגמרי למשל מספר שורה פונקציה שפה מקלדת מצב
  ראה ראיתי רואה תן אמר אמרתי אומר יודע יודעת לדעת חושב חושבת נראה עובר ללכת הולך בא באה שם שים
  תשים תוריד תעלה תריץ תבנה תפתח תסגור תשנה תחליף תמשיך תעצור תחזיר תנסה עזרה תעזור מסך חלון
  שרת לקוח משתמש נתונים טבלה רשימה שדה טקסט כותרת צבע גודל רוחב גובה עיצוב תמונה קישור הודעה
  פשוט באמת אחר אחרת אותם שלהם ביום זמן פעם עכשיו אחרון ראשון שוב גם כאן שם למעלה למטה ימין שמאל
`)

export const ENGLISH = words(`
  the be to of and a in that have i it for not on with he as you do at this but his by from they we
  say her she or an will my one all would there their what so up out if about who get which go me
  when make can like time no just him know take people into year your good some could them see other
  than then now look only come its over think also back after use two how our work first well way
  even new want because any these give day most us is are was were am been has had did does said
  fix bug code file run test add help please thanks thank yes ok okay hi hello hey world why where
  function class error build app need should here more sure change update remove check write read
  show create delete open close set list name type value data user page button text line next last
  same each both few many much very too again still never always really let lets try it's i'm don't
  can't doesn't isn't that's what's there's you're we're they're im dont cant thats whats
  npm git api css html js ts tsx json src dev ui ux url id db sql cli ai pr
`)
