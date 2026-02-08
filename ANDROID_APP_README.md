# Interest - Android WebView App Frame

To convert this website into an Android app, open **Android Studio**, create an "Empty Views Activity" project, and use the code below.

## 1. `AndroidManifest.xml`
Add Internet and Network State permissions. Add `android:usesCleartextTraffic="true"` if using HTTP.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.interest">

    <!-- REQUIRED PERMISSIONS -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Interest"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

## 2. `MainActivity.kt`
This code handles WebView configuration, Pull-to-Refresh, file uploads support, and offline detection.

```kotlin
package com.example.interest

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private val TARGET_URL = "https://your-blogger-site.blogspot.com" // CHANGE THIS TO YOUR URL

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_RESULT_CODE = 1

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefresh)

        setupWebView()

        swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                showOfflineMessage()
            }
        }

        if (isNetworkAvailable()) {
            webView.loadUrl(TARGET_URL)
        } else {
            showOfflineMessage()
            // Optional: load a local HTML file showing "No Internet"
            // webView.loadUrl("file:///android_asset/offline.html")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                swipeRefreshLayout.isRefreshing = false
                super.onPageFinished(view, url)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            // Support File Uploads
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                if (fileUploadCallback != null) {
                    fileUploadCallback!!.onReceiveValue(null)
                    fileUploadCallback = null
                }
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent()
                try {
                    startActivityForResult(intent, FILE_CHOOSER_RESULT_CODE)
                } catch (e: Exception) {
                    fileUploadCallback = null
                    return false
                }
                return true
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (fileUploadCallback == null) return
            val result = if (data == null || resultCode != RESULT_OK) null else data.data
            if (result != null) {
                fileUploadCallback?.onReceiveValue(arrayOf(result))
            } else {
                fileUploadCallback?.onReceiveValue(null)
            }
            fileUploadCallback = null
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val activeNetwork = connectivityManager.getNetworkCapabilities(network) ?: return false
        return when {
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> true
            activeNetwork.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> true
            else -> false
        }
    }

    private fun showOfflineMessage() {
        Toast.makeText(this, "No Internet Connection!", Toast.LENGTH_LONG).show()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // Add Options Menu (Rate, Share, Open in Browser)
    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menu?.add(0, 1, 0, "Rate this app")
        menu?.add(0, 2, 0, "Share this app")
        menu?.add(0, 3, 0, "Open in browser")
        return super.onCreateOptionsMenu(menu)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            1 -> {
                // Rate App (Play Store link)
                val uri = Uri.parse("market://details?id=$packageName")
                val intent = Intent(Intent.ACTION_VIEW, uri)
                startActivity(intent)
            }
            2 -> {
                // Share App
                val shareIntent = Intent(Intent.ACTION_SEND)
                shareIntent.type = "text/plain"
                shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Interest App")
                shareIntent.putExtra(Intent.EXTRA_TEXT, "Check out this amazing image sharing app! https://your-blogger-site.blogspot.com")
                startActivity(Intent.createChooser(shareIntent, "Share via"))
            }
            3 -> {
                // Open in External Browser
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(webView.url))
                startActivity(intent)
            }
        }
        return super.onOptionsItemSelected(item)
    }
}
```

## 3. `activity_main.xml`
Wrap WebView inside SwipeRefreshLayout.

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
```