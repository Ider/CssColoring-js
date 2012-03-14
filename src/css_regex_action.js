
/* element selection*/
function $I(id,obj_id)
{
    if (obj_id) 
    {
        var obj =$(obj_id)
        if(obj) return obj.getElementById(id);
    }
    else
        return document.getElementById(id);
}



function ForamtCss()
{
    var css = $I("original_css").value;
    var result = SyntaxColoring(css);
    $I("regex_css_display").innerHTML = "<pre>" +result+"</pre>";
    $I("regex_css_markup").value = HtmlEncode(result);
    $I("regex_css_text").value = result.replace(/\x3C.*?\x3E/g,"");
}

function SwitchResultPanel(panel)
{
    panel += "_panel";
    $I("display_panel").style.display = "none";
    $I("markup_panel").style.display = "none";
    $I("text_panel").style.display = "none";
    
    $I(panel).style.display = "block";
}
function HtmlEncode(original)
{
    var result = 
        original.replace(/\n|\r|\r\n| {2,}/g
                , function ($0)
                    {
                        if($0[0] == " ") return TextFormat.Space($0.length);
                        
                        return "<br />" + $0;
                    }
                );
    return result;
}

