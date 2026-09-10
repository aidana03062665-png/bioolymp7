TEACHER REACTION PATCH

Бұл патч тест біткеннен кейін мұғалімнің анимациялық реакциясын шығарады.

Қате санына қарай 5 вариант бар:
- 0-1 қате -> қатты мақтау
- 2-4 қате -> жақсы, бірақ кеңес береді
- 5-7 қате -> орташа, жинақтал дейді
- 8-11 қате -> қатаң ескерту
- 12+ қате -> өте қатаң реакция

Қолданылатын фотолар:
- teacher-success.jpg
- teacher-original.jpg
- teacher-original-2.jpg
- teacher-strict.jpg

Жүктеу керек 3 файл:
1) teacher-reaction.css
2) teacher-reaction.js
3) sw.js

Қадам:
- GitHub -> bioolymp7 -> Add file -> Upload files
- осы 3 файлды жүкте
- Commit changes
- 1-2 минут күт
- сайтта Ctrl + Shift + R
- телефонда сайтты толық жауып қайта аш

Егер кейбір тест бетінде автоматты түрде шықпаса,
код ішінде қолмен шақыру функциясы бар:
window.BioOlympTeacherReaction.show(қатеСаны, жалпыСұрақСаны)
Мысалы:
window.BioOlympTeacherReaction.show(6, 15)
