---
title: Скоригована Дохідність Стейкінгу
---

### Дилюція Токенів

Подібним чином ми можемо розглянути очікувану _Дилюцію Стейкінгу_ (тобто _Скориговану Дохідність Стейкінгу_) та _Дилюцію Нестейкінгованих Токенів_, як було визначено раніше. У цьому контексті _дилюція_ означає зміну фракційного представлення (тобто частки власності) набору токенів у рамках більшого пулу. У цьому сенсі дилюція може бути позитивною (збільшення частки власності, стейкінгова дилюція / _Скоригована Дохідність Стейкінгу_) або негативною (зменшення частки власності, нестейкінгова дилюція).

Нас цікавить відносна зміна власності стейкінгованих і нестейкінгованих токенів у міру збільшення загального пулу токенів через інфляційний випуск. Як було зазначено, цей випуск розподіляється лише серед власників стейкінгованих токенів, збільшуючи їх частку у _Загальному Поточному Обсязі_.

Продовжуючи з тими ж параметрами _Графіку Інфляції_, що й раніше, ми бачимо зростання частки стейкінгового пулу, як показано нижче.

![Графік зростання частки стейкінгового пулу](/assets/docs/economics/example_staked_supply_w_range_initial_stake.png)

Через цю відносну зміну у представництві частка стейкінгу будь-якого власника токенів також змінюється як функція _Графіку Інфляції_ та частки стейкінгованих токенів.

### Розрахунок Дилюції Нестейкінгованих Токенів

Особливий інтерес викликає _Дилюція Нестейкінгованих Токенів_, або $D_{us}$. У випадку нестейкінгованих токенів дилюція залежить лише від _Графіку Інфляції_, оскільки кількість нестейкінгованих токенів не змінюється з часом.

$$
\begin{aligned}
	D_{us} &= \left( \frac{P_{us}(t_{1}) - P_{us}(t_{0})}{P_{us}(t_{0})} \right)\\
		&= \left( \frac{ \left( \frac{SOL_{us}(t_{2})}{SOL_{total}(t_{2})} \right) - \left( \frac{SOL_{us}(t_{1})}{SOL_{total}(t_{1})} \right)}{ \left( \frac{SOL_{us}(t_{1})}{SOL_{total}(t_{1})} \right) } \right)\\
\end{aligned}
$$

Оскільки випуск інфляції лише збільшує загальну кількість токенів, а нестейкінгована кількість залишається незмінною:

$$
\begin{aligned}
	D_{us} &= \frac{1}{(1 + I_{1})} - 1\\
\end{aligned}
$$

Отже:

$$
D_{us} = -\frac{I}{I + 1}
$$

### Оцінка Скоригованої Дохідності Стейкінгу

Ми також можемо розрахувати _Скориговану Дохідність Стейкінгу_ $Y_{adj}$ як зміну частки стейкінгованих токенів у пулі:

$$
Y_{adj} = \frac{P_s(t_2) - P_s(t_1)}{P_s(t_1)}
$$

Це спрощується до:

$$
Y_{adj} = \frac{ 1 + I(t)/P_s(t) }{ 1 + I(t) } - 1
$$

### Відносна Дилюція

Відношення $D_{us}/Y_{adj}$ дозволяє зрозуміти, наскільки сильніше нестейкінговані токени піддаються дилюції у порівнянні зі стейкінгованими:

$$
\frac{D_{us}}{Y_{adj}} = \frac{ P_s }{ 1 - P_s }
$$

На основі цього видно, що збільшення частки стейкінгованих токенів значно збільшує дилюцію нестейкінгованих токенів. Наприклад, якщо $80\%$ токенів мережі стейкінговано, власник нестейкінгованих токенів зіткнеться з дилюцією у $400\%$ більшою, ніж стейкінгований власник.

Це підкреслює стимул для власників токенів до стейкінгу, щоб отримати _Дохідність Стейкінгу_ та уникнути _Дилюції Нестейкінгованих Токенів_.