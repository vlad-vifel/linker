package com.vladv.linker;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Native")
public class NativePlugin extends Plugin {

    @PluginMethod
    public void check(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", Build.VERSION.SDK_INT < Build.VERSION_CODES.R || Environment.isExternalStorageManager());
        call.resolve(result);
    }

    @PluginMethod
    public void request(PluginCall call) {
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
            Uri.parse("package:" + getContext().getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("NO_URL");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("NO_APP");
        }
    }

    @PluginMethod
    public void readClipboard(PluginCall call) {
        ClipboardManager manager = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = manager.getPrimaryClip();
        String text = "";
        if (clip != null && clip.getItemCount() > 0) {
            CharSequence value = clip.getItemAt(0).coerceToText(getContext());
            if (value != null) text = value.toString();
        }
        JSObject out = new JSObject();
        out.put("text", text);
        call.resolve(out);
    }

    @PluginMethod
    public void writeClipboard(PluginCall call) {
        ClipboardManager manager = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
        manager.setPrimaryClip(ClipData.newPlainText("link", call.getString("text", "")));
        call.resolve();
    }

    @PluginMethod
    public void pickFolder(PluginCall call) {
        startActivityForResult(call, new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE), "pickResult");
    }

    @PluginMethod
    public void pickFile(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(call, intent, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Uri uri = result.getResultCode() == android.app.Activity.RESULT_OK && result.getData() != null
            ? result.getData().getData()
            : null;
        JSObject out = new JSObject();
        if (uri == null) {
            out.put("path", JSObject.NULL);
            call.resolve(out);
            return;
        }
        String path = toPath(uri);
        if (path == null) {
            call.reject("BAD_LOCATION");
            return;
        }
        out.put("path", path);
        call.resolve(out);
    }

    private String toPath(Uri uri) {
        String id = null;
        if (DocumentsContract.isTreeUri(uri)) id = DocumentsContract.getTreeDocumentId(uri);
        else if (DocumentsContract.isDocumentUri(getContext(), uri)) id = DocumentsContract.getDocumentId(uri);
        if (id == null) return null;

        if ("com.android.externalstorage.documents".equals(uri.getAuthority())) {
            String[] parts = id.split(":", 2);
            String base = "primary".equals(parts[0])
                ? Environment.getExternalStorageDirectory().getPath()
                : "/storage/" + parts[0];
            return parts.length > 1 && !parts[1].isEmpty() ? base + "/" + parts[1] : base;
        }
        if (id.startsWith("raw:")) return id.substring(4);

        Uri target = uri;
        if (id.matches("(msf|image|video|audio|document):\\d+")) {
            long number = Long.parseLong(id.substring(id.indexOf(':') + 1));
            target = MediaStore.Files.getContentUri("external", number);
        }
        try (Cursor cursor = getContext().getContentResolver().query(target, new String[] { "_data" }, null, null, null)) {
            if (cursor != null && cursor.moveToFirst() && cursor.getString(0) != null) return cursor.getString(0);
        } catch (Exception ignored) {}
        return null;
    }
}
