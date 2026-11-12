# Mealwise user guide

Mealwise helps you keep track of the meal credit you receive and the money you
spend on meals. You enter your credit and meal purchases yourself. The app
calculates what is left and gives you a guide for your spending.

## What you can do

- **Create an account and log in.** Sign up with your name, email address, and
  password. After signing up, you are sent to the login page. You can show or
  hide your password while typing.
- **Keep your account private.** You need to log in to open the dashboard,
  budget details, or expense history. Logging out ends your current app
  session.
- **Add meal credit.** Enter the amount you received, how many days it should
  last, and the start date. Before saving, the app shows the expected end date
  and an initial daily spending guide.
- **Record meal purchases.** Enter the amount, a short description such as
  “Lunch,” and the date. The app updates your spending totals and balance.
- **Review and correct expenses.** The expense history lists purchases in the
  current credit period, newest first. You can edit an entry or delete it;
  totals are updated afterward.
- **Check your budget.** The dashboard shows your credit, amount spent,
  remaining balance, percentage used, budget dates, days remaining, and daily
  spending guide. It also shows recent purchases and some previous credit
  periods.
- **See more budget details.** The budget page shows your current period and
  its status, along with previous periods and their credit, spending, and
  remaining balance.
- **Get spending warnings.** The app warns when you have used at least 80% of
  your credit, when today's spending is above that day's guide, or when total
  spending is well ahead of the plan. It also clearly marks an ended or
  exhausted credit period.

The daily guide starts as your credit divided across the number of days you
choose. While the period is active, it changes based on the remaining balance
and remaining days. It is a recommendation, not a fixed daily limit. The app
does prevent an expense from exceeding the remaining credit.

## Your journey through the app

1. Open Mealwise and choose **Get started** to create an account, or choose
   **Log in** if you already have one.
2. After you create an account, Mealwise takes you to the login page and
   confirms that your account was created.
3. Log in with your email and password. A successful login opens your
   dashboard. If you try to open a protected page while logged out, Mealwise
   sends you to the login page.
4. If this is your first time, choose **Add meal credit**. Enter the money you
   received and how long it needs to last.
5. Each time you buy a meal, choose **Record expense** and enter its amount,
   description, and date.
6. Check the dashboard to see what remains and whether your spending needs
   attention. Open **Expense history** to review, edit, or delete purchases.
   Open **Budget details** to review the current and previous credit periods.
7. When a credit period is exhausted or has ended, add the next credit you
   receive to begin another period.

## Things to know

- Meal credits and purchases are entered by you; Mealwise does not import them
  automatically.
- Warnings appear in the app. They are not text-message, email, or push
  notifications.
- Previous periods are kept for reference. You can record expenses only in the
  current active credit period.
- The sample amounts on the home page are illustrations, not your account
  information.
- Your account and budget data are saved through the app's API in its
  PostgreSQL database. Passwords are protected by the backend and are not
  stored as plain text.
