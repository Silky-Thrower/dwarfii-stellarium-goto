/* eslint react/no-unescaped-entities: 0 */
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useEffect, useContext, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import { ConnectionContext } from "@/stores/ConnectionContext";
import {
  saveConnectionStatusStellariumDB,
  saveIPStellariumDB,
  savePortStellariumDB,
  saveUrlStellariumDB,
} from "@/db/db_utils";

type PropType = {
  showInfoTxt: boolean | undefined;
};

export default function ConnectStellarium(props: PropType) {
  const { showInfoTxt } = props;

  let connectionCtx = useContext(ConnectionContext);

  const [connecting, setConnecting] = useState(false);
  const [showInfoTxtData, setShowInfoTxtData] = useState(true);

  function checkConnection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formIP = formData.get("stellarium_ip");
    const formPort = formData.get("port");

    if (formIP && formPort) {
      setConnecting(true);
      let url = `http://${formIP}:${formPort}`;

      connectionCtx.setIPStellarium(formIP.toString());
      connectionCtx.setPortStellarium(Number(formPort));
      connectionCtx.setUrlStellarium(url);

      saveIPStellariumDB(formIP.toString());
      savePortStellariumDB(Number(formPort));
      saveUrlStellariumDB(url);

      fetch(url, { signal: AbortSignal.timeout(2000) })
        .then(() => {
          setConnecting(false);
          connectionCtx.setConnectionStatusStellarium(true);
          saveConnectionStatusStellariumDB(true);
        })
        .catch((err) => {
          console.log("Stellarium connection error:", err);
          setConnecting(false);
          connectionCtx.setConnectionStatusStellarium(false);
          saveConnectionStatusStellariumDB(false);
        });
    }
  }

  function renderConnectionStatus() {
    if (connecting) {
      return <span>Connecting...</span>;
    }
    if (connectionCtx.connectionStatusStellarium === undefined) {
      return <></>;
    }
    if (connectionCtx.connectionStatusStellarium === false) {
      return (
        <span className="text-danger-connect">{t("pConnectingFailed")}</span>
      );
    }

    return (
      <span className="text-success-connect">
        {t("pConnectionSuccessFull")}
      </span>
    );
  }
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    if (showInfoTxt !== undefined && !showInfoTxt) setShowInfoTxtData(false);

    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  function renderDetails() {
    if (showInfoTxtData)
      return (
        <ol>
          <li className="mb-2">{t("pConnectStellariumContent1")}</li>
          <li className="mb-2">
            {t("pConnectStellariumContent2")}{" "}
            <Link href="https://www.youtube.com/watch?v=v2gROUlPRhw">
              Youtube video
            </Link>{" "}
            {t("pConnectStellariumContent2_1")}
          </li>
          <li className="mb-2">{t("pConnectStellariumContent3")}</li>
        </ol>
      );
    else return <ol></ol>;
  }

  return (
    <div>
      <h2>{t("pConnectStellarium")}</h2>

      <p>{showInfoTxtData && t("pConnectStellariumContent")}</p>
      {renderDetails()}
      <form onSubmit={checkConnection}>
        <div className="row mb-3">
          <div className="col-md-1">
            <label htmlFor="stellarium_ip" className="form-label">
              {t("pIPAdress")}
            </label>
          </div>
          <div className="col-lg-2 col-md-10">
            <input
              className="form-control"
              id="stellarium_ip"
              name="stellarium_ip"
              placeholder="127.00.00.00"
              required
              defaultValue={connectionCtx.IPStellarium}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-1">
            <label htmlFor="port" className="form-label">
              {t("pPort")}
            </label>
          </div>
          <div className="col-lg-2 col-md-10">
            <input
              className="form-control"
              id="port"
              name="port"
              placeholder="8000"
              required
              defaultValue={connectionCtx.portStellarium}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-more02 me-3">
          <i className=" icon-connectdevelop" /> {t("pConnect")}
        </button>{" "}
        {renderConnectionStatus()}
      </form>
    </div>
  );
}
