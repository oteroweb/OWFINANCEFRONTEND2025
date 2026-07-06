package com.owfinance.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // MIUI y otros fabricantes propagan el "tamaño de fuente/pantalla" del
    // sistema al WebView, inflando el layout ~120% aunque la app use px/rem
    // fijos. Forzamos textZoom a 100 para que la UI se vea igual sin importar
    // la configuración de accesibilidad de fuente del dispositivo.
    getBridge().getWebView().getSettings().setTextZoom(100);
  }
}
