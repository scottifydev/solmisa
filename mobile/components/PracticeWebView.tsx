import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { Colors } from "../constants/theme";

const BASE_URL = "https://solmisa.com";

const INJECTED_CSS = `
  nav.sticky { display: none !important; }
  main { padding-bottom: 0 !important; }
`;

const INJECT_JS = `
  (function() {
    var s = document.createElement('style');
    s.textContent = ${JSON.stringify(INJECTED_CSS)};
    document.head.appendChild(s);
  })();
  true;
`;

interface PracticeWebViewProps {
  path: string;
}

export function PracticeWebView({ path }: PracticeWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  function handleNavigationStateChange(nav: WebViewNavigation) {
    // Block navigation outside /practice/*
    if (nav.url && !nav.url.startsWith(`${BASE_URL}/practice`)) {
      webViewRef.current?.goBack();
    }
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.violet} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: `${BASE_URL}${path}` }}
        style={styles.webview}
        injectedJavaScript={INJECT_JS}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        originWhitelist={["https://*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.night,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.night,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.night,
    zIndex: 10,
  },
});
