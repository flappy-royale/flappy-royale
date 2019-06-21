package com.lazerwalker.flappyroyale

import android.Manifest
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.support.v4.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import android.view.View
import java.util.*
import android.Manifest.permission
import android.Manifest.permission.WRITE_CONTACTS
import android.app.Activity
import android.support.v4.app.ActivityCompat.requestPermissions
import android.content.pm.PackageManager
import android.os.Handler
import android.support.v4.app.ActivityCompat
import android.support.v4.content.ContextCompat
import android.support.v4.content.ContextCompat.checkSelfPermission


class ShareManager(private val context: Context, val webview: WebView, val activity: Activity) {
    @JavascriptInterface
    fun shareScreenshot(text: String) {
        val bitmap = screenshot(webview)

        // Executing JS back has to happen on the main thread
        val mainHandler = Handler(context.getMainLooper());
        val myRunnable = Runnable() {
            @Override
            fun run() {
                webview.evaluateJavascript("window.dispatchEvent(new Event('screenshotComplete'));", null)

            }
        };
        mainHandler.post(myRunnable);

        val uri = uriForSavedBitmap(bitmap, activity)

        val shareIntent = Intent()
        shareIntent.action = Intent.ACTION_SEND
        shareIntent.putExtra(Intent.EXTRA_TEXT, text)
        shareIntent.putExtra(Intent.EXTRA_STREAM, uri)
        shareIntent.type = "image/*"
        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

        context.startActivity(Intent.createChooser(shareIntent, "Share"))
    }
}

fun screenshot(view: View): Bitmap {
    val bitmap = Bitmap.createBitmap(
        view.width,
        view.height, Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)
    view.draw(canvas)
    return bitmap
}

fun uriForSavedBitmap(bitmap: Bitmap, activity: Activity): Uri? {
    val now = Date()
    android.text.format.DateFormat.format("yyyy-MM-dd_hh:mm:ss", now)
    val mPath = Environment.getExternalStorageDirectory().absolutePath + "/" + now + ".jpg"

    if (ContextCompat.checkSelfPermission(activity,
            Manifest.permission.WRITE_EXTERNAL_STORAGE)
        != PackageManager.PERMISSION_GRANTED) {

        // TODO: After granting permission, a callback comes back to the Application object.
        // We should manually retry the share when that happens
        // That requires our own application subclass, and knowing how to thread back into here.
        // (That "123" number should be an appwide const we refer to in the callback)
        ActivityCompat.requestPermissions(activity,
                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                123)

        return null
    }

    val imageFile = File(mPath)
    val outputStream = FileOutputStream(imageFile)
    val quality = 100
    bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
    outputStream.flush()
    outputStream.close()

    return Uri.fromFile(imageFile)
}