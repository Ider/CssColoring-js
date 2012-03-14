/************** Extension Functions for String **************/
String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, "");}
String.prototype.ltrim = function(){return this.replace(/^\s+/g, "");}

/************** Format Setting **************/
var FormatSetting = {
    HasPreTag: false

};

/************** CSS Regular Expression Controller **************/
var CssREC = {

/*******    Pseudo Private Values   *******/
    Proto:
        {
            comment:/\s*\/\*(?:\s|.)*?\*\//,
            
            definition: /\s*([^\{\}\s;\/][^\{\};]*){([^\{\}]*[^\s\{\}]|.{0})\s*}/,
            selector: /\s*([^\s,](?:[^,]*[^,\s])?)\s*(,|$)/ ,
            property: /\s*([\w\-]+)\s*:\s*([^;]*[^;\s])\s*(?:;|$)/
            //property_name:
            //property_value:
        },
    
/*******    Getter Properties   *******/
    get CommentMatcher()
        {
            return new RegExp(this.Proto.comment.source,"g");   
        },
    
    get DefinitionMatcher()
        {
            //var pattern = this.Proto.comment + "|" + this.Proto.definition;
            var pattern = this.PatternsConcat(this.Proto.comment, this.Proto.definition);
            return new RegExp(pattern,"g");
        },
    
    get SelectorMatcher()
        {   
            //var pattern = this.Proto.comment + "|" + this.Proto.selector;
            var pattern = this.PatternsConcat(this.Proto.comment, this.Proto.selector);
            return new RegExp(pattern, "g");
        },
    
    get PropertyMatcher()
        {
            //var pattern = this.Proto.comment + "|" + this.Proto.property;
            var pattern = this.PatternsConcat(this.Proto.comment, this.Proto.property);
            return new RegExp(pattern, "g");
        },
    get EndlineMatcher()
        {
            return /\n|\r|\r\n/g;
        },
    get SpaceMatcher()
        {
            return / {2,}/g;
        },

/*******    Auxiliary Methods   *******/    
    PatternsConcat: function()
        {
            var pattern = "";
            var temp;
            var arg;
            for(var i=0; i < arguments.length; ++i)
            {
                arg = arguments[i];
                temp = "" + (arg instanceof RegExp? arg.source:arg);
                if(temp.length > 0)
                    pattern += (pattern.length>0?"|":"") + temp; 
            }
            
            return pattern;
        },
    
    IsComment: function(content)
        {
            if (content == undefined || content.length<4) return false;
            
            return /^\s*\/\*/.test(content);
        }
    /*do not forget add colon "," after properties definition*/
};



/************** Matching Replacement **************/
function SyntaxColoring(css)
{
    if(typeof(css) != "string") return css;
    
    var result = css.replace(CssREC.DefinitionMatcher, DefinitionColoring).ltrim();
    
    //if(!FormatSetting.HasPreTag)
        //result = result.replace(CssREC.EndlineMatcher, TextFormat.Endline);
    
    return result;
    //.replace(CssREC.SpaceMatcher, function($0){return TextFormat.Space($0.length)});
}


/**
$0,$1,$2,$3 are matched group for regular expression,
the first one would be whole matched string, 
the last one would be the index at which to start the next match.

When use RegExp.exec function, each group will be saved in result array,
if there is no match, undefined will be saved.

But for following function parameter, Firefox will pass empty string("") if group match nothing
where Chrome pass undefined.
So codes need to check ($1 == undefined || $1.length<=0) to be compatible with both Firefox and Chrome

**/

function DefinitionColoring($0,$1,$2,$3)
{
    //comment matched
    if(CommentMatched($1) 
//        || CssREC.IsComment($0)
    ) return (TextFormat.Endline + TextFormat.Endline + TextFormat.Comment($0));
    
    //css definition matched
    var seletors = $1.replace(CssREC.SelectorMatcher, SeletorColoring);
    var properties = $2.replace(CssREC.PropertyMatcher, PropertyColoring);
    
    return TextFormat.Definition(seletors, properties);
}

function SeletorColoring($0,$1,$2,$3)
{
    //comment matched
    if(CommentMatched($1) 
//        || CssREC.IsComment($0)
    ) return (TextFormat.Comment($0) + TextFormat.Endline);
    
    //in future, here will be more analysis for selector, id, type, class will be all coloring seperately
    
    $1 = $1.replace(CssREC.CommentMatcher, TextFormat.Comment("$&"));
    return TextFormat.Seletor($1,$2);
}

function PropertyColoring($0,$1,$2,$3)
{
    //comment matched
    if(CommentMatched($1) 
//        || CssREC.IsComment($0)
    ) return ((CssREC.EndlineMatcher.test(/^\s*/.exec($0))? TextFormat.Endline:"")  
                + TextFormat.Indent
                + TextFormat.Comment($0));
    
    //$2 = $2.replace(CssREC.CommentMatcher, "<span class=\"comment\" >$&</span>");
    $2 = $2.replace(CssREC.CommentMatcher, TextFormat.Comment("$&"));
    //$2 = $2.replace(CssREC.CommentMatcher, function($0){ TextFormat.Comment($0)});
    
    return TextFormat.Property($1,$2);
}

function CommentMatched($1) //This checked may be much efficient than CssREC.IsComment, as no more RegExp match required
{
    return ($1 == undefined || ($1).length<=0);
}


/************** Text Coloring Format **************/
var TextFormat = {
/*******    Basic Format Function    *******/   
    Wrap: function(content, classNames, tagName)
        {
            if(content == null || content.length == 0) return "" ;
            if(tagName == undefined || tagName == null || (tagName = "" + tagName ).length == 0)
                tagName = this.Tag;
                
            var cssClass = "";
            if(classNames != undefined && classNames != null)
            {
                if(Array.isArray(classNames))   //if(classNames.join != undifined) //this may compatible to IE 8-
                    cssClass = classNames.join(" ");
                else
                    cssClass = "" + classNames;
            }
            
            var openTag = "<" + tagName+ ">";
            var closeTag = "</" + tagName +">";
            
             if(cssClass.length > 0)
                openTag = "<" + tagName + " class=\"" + cssClass +"\" >";
            
            var wraped = openTag + content + closeTag;
            
            return wraped;
        },        
    Space: function(num)
        {
            var times = parseInt(num);
            times = (times == NaN? 1:times+1); // times+1 length array has times intervals
            
            return new Array(times).join("&nbsp;");
        },
        
/*******    CSS Wrapper Functinons    *******/
    Comment:function(content)
        {
            return this.Wrap(content.trim(), "comment");
        },
    Definition:function(selectors, properties)
        {
            return selectors
                + this.Endline + "{"
                + properties
                + this.Endline + "}";
        },
    Seletor:function(selector, seperator)
        {
            return this.Endline + this.Wrap(selector, "selector") + seperator;
        },
    Property:function(name, value)
        {
            return this.Endline + this.Indent + this.Wrap(name, ["property","name"])  + ": "
                + this.Wrap(value, ["property","value"]) + ";";     
        },

    Tag:"span",
    Endline: "\n", //or "<br />"
    get Indent(){return "    "; }//this.Space(4);
};

