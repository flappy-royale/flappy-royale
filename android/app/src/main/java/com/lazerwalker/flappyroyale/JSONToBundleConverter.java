package com.lazerwalker.flappyroyale;

import android.os.Bundle;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Iterator;

// From https://stackoverflow.com/questions/28984789/convert-json-to-android-bundle
public class JSONToBundleConverter {
    /** Convert a JSON object to a Bundle that can be passed as the extras of
     * an Intent. It passes each number as a double, and everything else as a
     * String, arrays of those two are also supported. */
    public static Bundle fromJson(JSONObject s) {
        Bundle bundle = new Bundle();

        for (Iterator<String> it = s.keys(); it.hasNext(); ) {
            String key = it.next();
            JSONArray arr = s.optJSONArray(key);
            Double num = s.optDouble(key);
            String str = s.optString(key);

            if (arr != null && arr.length() <= 0)
                bundle.putStringArray(key, new String[]{});

            else if (arr != null && !Double.isNaN(arr.optDouble(0))) {
                double[] newarr = new double[arr.length()];
                for (int i=0; i<arr.length(); i++)
                    newarr[i] = arr.optDouble(i);
                bundle.putDoubleArray(key, newarr);
            }

            else if (arr != null && arr.optString(0) != null) {
                String[] newarr = new String[arr.length()];
                for (int i=0; i<arr.length(); i++)
                    newarr[i] = arr.optString(i);
                bundle.putStringArray(key, newarr);
            }

            else if (!num.isNaN())
                bundle.putDouble(key, num);

            else if (str != null)
                bundle.putString(key, str);

            else
                System.err.println("unable to transform json to bundle " + key);
        }

        return bundle;
    }
}
