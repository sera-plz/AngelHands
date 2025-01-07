import React from "react";
import { useTranslation } from "react-i18next";
import {
  BaseModalDescription,
  BaseModalTitle,
} from "../confirmation-modals/base-modal";
import { ModalBody } from "../modal-body";
import { AvailableLanguages } from "#/i18n";
import { I18nKey } from "#/i18n/declaration";
import { useAuth } from "#/context/auth-context";
import { handleCaptureConsent } from "#/utils/handle-capture-consent";
import { ModalButton } from "../../buttons/modal-button";
import { CustomInput } from "../../custom-input";
import { FormFieldset } from "../../form-fieldset";
import { useConfig } from "#/hooks/query/use-config";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";

interface AccountSettingsFormProps {
  onClose: () => void;
  selectedLanguage: string;
  gitHubError: boolean;
  analyticsConsent: string | null;
}

export function AccountSettingsForm({
  onClose,
  selectedLanguage,
  gitHubError,
  analyticsConsent,
}: AccountSettingsFormProps) {
  const { gitHubToken, setGitHubToken, logout } = useAuth();
  const { data: config } = useConfig();
  const { mutate: saveSettings } = useSaveSettings();
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const ghToken = formData.get("ghToken")?.toString();
    const language = formData.get("language")?.toString();
    const analytics = formData.get("analytics")?.toString() === "on";

    if (ghToken) setGitHubToken(ghToken);

    // The form returns the language label, so we need to find the corresponding
    // language key to save it in the settings
    if (language) {
      const languageKey = AvailableLanguages.find(
        ({ label }) => label === language,
      )?.value;

      if (languageKey) saveSettings({ LANGUAGE: languageKey });
    }

    handleCaptureConsent(analytics);
    const ANALYTICS = analytics.toString();
    localStorage.setItem("analytics-consent", ANALYTICS);

    onClose();
  };

  return (
    <ModalBody>
      <form className="flex flex-col w-full gap-6" onSubmit={handleSubmit}>
        <div className="w-full flex flex-col gap-2">
          <BaseModalTitle title={t(I18nKey.ACCOUNT_SETTINGS$TITLE)} />

          {config?.APP_MODE === "saas" && config?.APP_SLUG && (
            <a
              href={`https://github.com/apps/${config.APP_SLUG}/installations/new`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {t(I18nKey.CONFIGURE_GITHUB_REPOS)}
            </a>
          )}
          <FormFieldset
            id="language"
            label={t(I18nKey.LANGUAGE_LABEL)}
            defaultSelectedKey={selectedLanguage}
            isClearable={false}
            items={AvailableLanguages.map(({ label, value: key }) => ({
              key,
              value: label,
            }))}
          />

          {config?.APP_MODE !== "saas" && (
            <>
              <CustomInput
                name="ghToken"
                label={t(I18nKey.GITHUB_TOKEN_OPTIONAL)}
                type="password"
                defaultValue={gitHubToken ?? ""}
              />
              <BaseModalDescription>
                {t(I18nKey.GET_YOUR_TOKEN)}{" "}
                <a
                  href="https://github.com/settings/tokens/new?description=openhands-app&scopes=repo,user,workflow"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#791B80] underline"
                >
                  {t(I18nKey.HERE)}
                </a>
              </BaseModalDescription>
            </>
          )}
          {gitHubError && (
            <p className="text-danger text-xs">
              {t(I18nKey.GITHUB_TOKEN_INVALID)}
            </p>
          )}
          {gitHubToken && !gitHubError && (
            <ModalButton
              variant="text-like"
              text={t(I18nKey.DISCONNECT_BUTTON)}
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-danger self-start"
            />
          )}
        </div>

        <label className="flex gap-2 items-center self-start">
          <input
            name="analytics"
            type="checkbox"
            defaultChecked={analyticsConsent === "true"}
          />
          {t(I18nKey.ENABLE_ANALYTICS)}
        </label>

        <div className="flex flex-col gap-2 w-full">
          <ModalButton
            type="submit"
            intent="account"
            text={t(I18nKey.SAVE_BUTTON)}
            className="bg-[#4465DB]"
          />
          <ModalButton
            text={t(I18nKey.CLOSE_BUTTON)}
            onClick={onClose}
            className="bg-[#737373]"
          />
        </div>
      </form>
    </ModalBody>
  );
}
