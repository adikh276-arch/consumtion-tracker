import { Check, BarChart3, X, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { saveCheckIn, getTodayKey, getHistory, CheckInEntry, getWeekDates, getWeekHistory } from "@/lib/checkin-storage";
import WeeklyHistory from "@/components/WeeklyHistory";

type Screen =
  | "history"
  | "start"
  | "how-many"
  | "urge-time"
  | "feel"
  | "reflection"
  | "yes-done"
  | "no-reinforce"
  | "no-close"
  | "final-done";

const slide = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const SmokeCheck = () => {
  const { t } = useTranslation();
  const [hasAnyHistory, setHasAnyHistory] = useState(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [smoked, setSmoked] = useState("");
  const [count, setCount] = useState("");
  const [urge, setUrge] = useState("");
  const [feeling, setFeeling] = useState("");
  const [step, setStep] = useState("");

  useEffect(() => {
    const checkHistory = async () => {
      const history = await getHistory();
      if (history.length > 0) {
        setHasAnyHistory(true);
        setScreen("history");
      }
    };
    checkHistory();
  }, []);

  const go = (next: Screen, delay = 350) => {
    setTimeout(() => setScreen(next), delay);
  };

  const saveAndFinish = async (didSmoke: boolean) => {
    await saveCheckIn({
      date: getTodayKey(),
      smoked: didSmoke,
      ...(didSmoke && {
        count,
        urgeTime: urge,
        feeling,
        reflection: step || undefined,
      }),
    });
    setHasAnyHistory(true);
  };

  const countOptions = [
    t("options.count.1"),
    t("options.count.2_3"),
    t("options.count.4_5"),
    t("options.count.more_5"),
  ];
  const urgeOptions = [
    t("options.urge.morning"),
    t("options.urge.afternoon"),
    t("options.urge.evening"),
    t("options.urge.late_night"),
  ];
  const feelOptions = [
    t("options.feel.okay"),
    t("options.feel.neutral"),
    t("options.feel.not_great"),
  ];

  return (
    <div className="sc-gradient min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">

          {/* WEEKLY HISTORY */}
          {screen === "history" && (
            <WeeklyHistory
              key="history"
              onClose={() => setScreen("start")}
            />
          )}

          {/* SCREEN 1 – Start */}
          {screen === "start" && (
            <motion.div key="start" {...slide} className="flex flex-col items-center text-center gap-8">
              <span className="text-4xl">🚬</span>
              <div>
                <h1 className="sc-heading text-[1.75rem] mb-2">{t("app.title")}</h1>
                <p className="sc-body text-sc-midnight/50 text-sm">{t("app.subtitle")}</p>
              </div>
              <p className="sc-body text-lg text-sc-midnight">{t("app.check_in")}</p>
              <div className="flex flex-col gap-3 w-full">
                {[t("app.yes"), t("app.no")].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSmoked(opt);
                      go(opt === t("app.no") ? "no-reinforce" : "how-many");
                    }}
                    className={`sc-pill w-full ${smoked === opt ? "sc-pill-midnight" : "sc-pill-outline"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {hasAnyHistory && (
                <button
                  onClick={() => setScreen("history")}
                  className="flex items-center gap-2 text-sm sc-body text-sc-midnight/40 hover:text-sc-midnight/60 transition-colors mt-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  {t("app.view_history")}
                </button>
              )}
            </motion.div>
          )}

          {/* YES – How many */}
          {screen === "how-many" && (
            <motion.div key="how-many" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("app.how_many")}</p>
              <div className="flex flex-col gap-3 w-full">
                {countOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setCount(opt);
                      go("urge-time");
                    }}
                    className={`sc-pill w-full ${count === opt ? "sc-pill-coral" : "sc-pill-outline"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Urge time */}
          {screen === "urge-time" && (
            <motion.div key="urge-time" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("app.urge_time")}</p>
              <div className="flex flex-col gap-3 w-full">
                {urgeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setUrge(opt);
                      go("feel");
                    }}
                    className={`sc-pill w-full ${urge === opt ? "sc-pill-sage" : "sc-pill-outline"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Feel */}
          {screen === "feel" && (
            <motion.div key="feel" {...slide} className="flex flex-col items-center text-center gap-8">
              <p className="sc-body text-lg text-sc-midnight">{t("app.feel")}</p>
              <div className="flex flex-col gap-3 w-full">
                {feelOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFeeling(opt);
                      go("reflection");
                    }}
                    className={`sc-pill w-full ${feeling === opt ? "sc-pill-coral" : "sc-pill-outline"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* YES – Reflection */}
          {screen === "reflection" && (
            <motion.div key="reflection" {...slide} className="flex flex-col items-center text-center gap-6">
              <p className="sc-body text-lg text-sc-midnight">
                {t("app.next_time")}
              </p>
              <input
                type="text"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder={t("app.reflection_placeholder")}
                className="sc-input"
                autoFocus
              />
              <button
                onClick={async () => {
                  await saveAndFinish(true);
                  setScreen("yes-done");
                }}
                className="sc-pill sc-pill-midnight sc-shadow mt-2"
              >
                {t("app.save")}
              </button>
            </motion.div>
          )}

          {/* YES – Done */}
          {screen === "yes-done" && (
            <motion.div key="yes-done" {...fade} className="flex flex-col items-center text-center gap-5">
              <p className="sc-heading text-xl text-sc-midnight">
                {t("app.awareness")}
              </p>
              <p className="sc-body text-sm text-sc-midnight/60 max-w-[280px] leading-relaxed">
                {t("app.tomorrow")}
              </p>
              <button
                onClick={() => setScreen("final-done")}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("app.done")}
              </button>
            </motion.div>
          )}

          {/* NO – Reinforcement */}
          {screen === "no-reinforce" && (
            <motion.div key="no-reinforce" {...fade} className="flex flex-col items-center text-center gap-5">
              <h2 className="sc-heading text-2xl text-sc-midnight">
                {t("feedback.stayed_smoke_free")}
              </h2>
              <p className="sc-body text-sm text-sc-midnight/60">
                {t("feedback.choice_matters")}
              </p>
              <button
                onClick={async () => {
                  await saveAndFinish(false);
                  go("no-close", 0);
                }}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("feedback.continue")}
              </button>
            </motion.div>
          )}

          {/* NO – Close */}
          {screen === "no-close" && (
            <motion.div key="no-close" {...fade} className="flex flex-col items-center text-center gap-5">
              <p className="sc-heading text-xl text-sc-midnight">
                {t("feedback.strengthening")}
              </p>
              <p className="sc-body text-sm text-sc-midnight/60 max-w-[280px] leading-relaxed">
                {t("feedback.keep_showing_up")}
              </p>
              <button
                onClick={() => setScreen("final-done")}
                className="sc-pill sc-pill-midnight sc-shadow mt-6"
              >
                {t("feedback.finish")}
              </button>
            </motion.div>
          )}

          {/* FINAL DONE – Checkmark */}
          {screen === "final-done" && (
            <motion.div
              key="final-done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-sc-sage flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="sc-heading text-lg text-sc-midnight">{t("feedback.saved")}</p>

              <button
                onClick={() => setScreen("history")}
                className="flex items-center gap-2 text-sm sc-body text-sc-midnight/40 hover:text-sc-midnight/60 transition-colors mt-4"
              >
                <BarChart3 className="w-4 h-4" />
                {t("feedback.view_week")}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmokeCheck;
