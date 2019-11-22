import React, {Component, useState, useEffect} from 'react'
import styled from '@emotion/styled'
import {
  AnchorButton,
  FadeRightAnimation,
  FadeBottomAnimation,
  Spinner
} from './styles/styled'

import gravatar from "./shared/gravatar"
//import graphql from './graphql/client'
import {
  ARTICLES,
  SEARCH_ARTICLES
} from './graphql/queries'

const HomePanel = ({
  viewConversations,
  displayNewConversation,
  updateHeader,
  transition,
  displayArticle,
  appData,
  agents,
  t,
  graphqlClient
})=>{

  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState([])

  const [meta, setMeta] = useState({})

  let textInput = React.createRef();

  useEffect(()=>(
    updateHeader(
      {
        translateY: 0 , 
        opacity: 1, 
        height: '212px' 
      }
    )
  ), [])

  useEffect(()=>(
    getArticles()
  ), [])

  const getArticles = ()=>{
    graphqlClient.send(ARTICLES, {
      domain: appData.articleSettings.subdomain,
      lang: "en",
      page: 1,
      per: 5,
    }, {
      success: (data)=>{
        const {collection, meta} = data.helpCenter.articles
        setArticles(collection)
        setMeta(meta)
      },
      error: ()=>{
        debugger
      }
    })
  }

  const handleScroll = (e)=>{
    window.a = e.target
    const target = e.target
    const val = 1 - normalize(target.scrollTop, target.offsetHeight, 0 )
    const pge = percentage(target.scrollTop, target.offsetHeight)
    //console.log(val)
    const opacity = val === 1 ? val : val * 0.3

    updateHeader({
      translateY: - pge , 
      opacity: opacity, 
      height: '212px' 
    })
  }

  const normalize = (val, max, min)=> { 
    return (val - min) / (max - min)
  }

  const percentage = (partialValue, totalValue)=>{
    return (100 * partialValue) / totalValue;
  }

  function handleSearch(e) {
    console.log(textInput.value)
    if(e.keyCode === 13){
      searchArticles(textInput.value)
    } 
  }

  function searchArticles(term){
    setLoading(true)
    graphqlClient.send(SEARCH_ARTICLES, {
      domain: appData.articleSettings.subdomain,
      term: term,
      lang: "en",
      page: 1,
      per: 5,
    }, {
      success: (data)=>{
        const {collection, meta} = data.helpCenter.search
        setArticles(collection)
        setMeta(meta)
        setLoading(false)
      },
      error: ()=>{
        setLoading(true)
      }
    })
  }

  function renderAvailability(){
    if(!appData.inBusinessHours){
      return <div>
                {
                  appData.businessBackIn && aa()
                }
              </div>
    }else {
      return <p/>
    }
  }

  function aa(){
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    const val = Math.floor(appData.businessBackIn.days)
    const at = new Date(appData.businessBackIn.at)
    const nextDay = at.getDay()
    const today = new Date(Date.now()).getDay()
    const sameDay = nextDay === today
    const nextWeek = nextDay < today

    if(nextWeek) return <div>volvemos la proxima semana</div>
    if(sameDay) return <p>{t("availability.aprox", {time: at.getHours() })}</p>

    switch (val) {
      case 1:
        return <div>{t("availability.tomorrow")}</div>
      case 2:
      case 3:
      case 4:
      case 5:
        return <div>{t("availability.days", {val: val})}</div>
      case 6:
        return <div>{t("availability.next_week")}</div>
      default:
        if(val === 0){
          if(sameDay){
            return t("availability.back_from", {hours: at.getHours() })
          } else {
            return t("availability.tomorrow_from", {hours: at.getHours() })
          }
        }
        return <p>dont now?</p>

    }
  }

  function replyTimeMessage(){
    /*const replyTime = [
      {value: "auto", label: "Automatic reply time. Currently El equipo responderá lo antes posible"}, 
      {value: "minutes", label: "El equipo suele responder en cuestión de minutos."},
      {value: "hours", label: "El equipo suele responder en cuestión de horas."},
      {value: "1 day", label: "El equipo suele responder en un día."},
    ]

    const message = replyTime.find((o)=> o.value === appData.replyTime)

    return message && <p>{message.label}</p>*/
    return <p>{t(`reply_time.${appData.replyTime}`)}</p>
  }

  return (

    <Panel onScroll={handleScroll}>
      
      {
        appData.inboundSettings.enabled &&
        <ConversationInitiator in={transition}>
        
          <h2>{t("start_conversation")}</h2>

          {renderAvailability()}
          
          {replyTimeMessage()}

          <CardContent>

            <ConnectedPeople>
              {
                agents.map((agent)=>(
                  <Avatar key={`home-agent-${agent.name}`}>
                    <img src={gravatar(agent.email)} title={agent.name}/>
                  </Avatar>
                ))
              }
            </ConnectedPeople>

            <CardButtonsGroup>

              <AnchorButton href="#" onClick={displayNewConversation}>
                {t("start_conversation")}
              </AnchorButton>

              <a href="#" onClick={viewConversations}>
                {t("see_previous")}
              </a>

            </CardButtonsGroup>
          
          </CardContent>
        
        </ConversationInitiator> 
      }

      <ConversationsBlock in={transition}>
        
        <CardButtonsGroup>
          <h2>{t("conversations")}</h2>
          <a href="#" onClick={viewConversations}>
            {t("see_previous")}
          </a>
        </CardButtonsGroup>
        <CardContent>
          bla bla , show conversations here!
        </CardContent>
      </ConversationsBlock>
    

      <Card in={transition}>
        {t("search_articles")}
        <ButtonWrapper>
          <input ref={(ref)=> textInput = ref} 
            placeholder={ t("search_articles") } 
            onKeyDown={handleSearch}
          /> 
          <button onClick={()=> searchArticles(textInput.value)}>
            {loading ? <Spinner/> : 'go' }
          </button>
        </ButtonWrapper>
      </Card>

      <ArticleList>

        <h2>
          {t("latest_articles")}
        </h2>
      
        {
          articles.map((article, i)=>(
            <ArticleCard key={`article-card-${article.id}`} 
              article={article} 
              displayArticle={displayArticle}
            />
          ))
        }
      
      </ArticleList>
    
      </Panel>
  )
}

const ArticleCard = ({article, displayArticle})=>{
  return (

    <ArticleCardWrapper onClick={(e)=> displayArticle(e, article) }>
    
      <ArticleCardTitle>
        {article.title}
      </ArticleCardTitle>

      <ArticleCardContent>
        {article.description}
      </ArticleCardContent>
    
    </ArticleCardWrapper>

  )
}

const Panel = styled.div`
  position: fixed;
  top: 17px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  overflow: scroll;
  width: 100%;
  height: 97%;
  z-index: 1000;
`

const ButtonWrapper = styled.div`
  display: flex;

  input{
    padding: 1em;
    flex-grow: 2;
    border: 1px solid #ccc;
    border-right: 0px solid #ccc;
  }

  button{
    border: 1px solid #ccc;
    padding: 1.2em;
    border-bottom-right-radius: 6px;
    border-top-right-radius: 6px;
    background: aliceblue;
  }
`

const CardButtonsGroup = styled.div`
  margin-top: 1em;
  align-items: center;
  justify-content: space-evenly;
  display: flex;
  a, a:link, a:visited, a:focus, a:hover, a:active{
    color: rgb(0,119,204);
    text-decoration:none; 
    //cursor: crosshair;
  }

`

const Avatar = styled.div`
  -webkit-box-flex: 0;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  align-self: center;
  img {
    width: 50px;
    height: 50px;
    text-align: center;
    border-radius: 50%;
    border: 3px solid white;
  }
`

const Card = styled.div`
  margin-bottom: 17px;
  background-color: #fff;
  border-radius: 3px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  overflow: hidden;
  position: relative;
  //-webkit-box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 rgba(48, 71, 236, 0.5);
  box-shadow: 0 4px 15px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.1), inset 0 2px 0 0 rgba(48, 71, 236, 0.5);

  margin: 1em;
  padding: 2em;

  ${(props)=> FadeRightAnimation(props)}

`


const ConversationInitiator = styled(Card)`
  margin-top: 10em;
  h2{
    margin: .4em 0 0.4em 0em;
  }
`

const ConversationsBlock = styled(Card)`
  margin-top: 1em;
  h2{
    margin: .4em 0 0.4em 0em;
  }
`

const CardContent = styled.div`
`

const ConnectedPeople = styled.div`
  display: flex;
  div{
    margin-right: -10px;
  }
`

const ArticleList = styled.div`
  margin: .8em;
`

const ArticleCardWrapper = styled.div`
  cursor: pointer;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(193, 203, 212, 0.7) 0px 0px 0px 1px inset, rgb(193, 203, 212) 0px -1px 0px 0px inset;
  transform: translateZ(0px);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  transition: all 550ms cubic-bezier(0.23, 1, 0.32, 1) 0s;
  text-decoration: none;
  padding: 20px 20px 22px;
  margin-bottom: 0.3em;
  &:hover{
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(193, 203, 212, 0.7) 0px 0px 0px 1px inset, rgb(193, 203, 212) 0px -1px 0px 0px inset;
    transform: translate(0px, -2px);
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
  }
  &:after{
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 40px 0px;
    content: "";
    height: 100%;
    left: 0px;
    opacity: 0;
    position: absolute;
    top: 0px;
    transform: translateZ(0px);
    width: 100%;
    z-index: -1;
    border-radius: 4px;
    transition: all 200ms linear 0s;
  }
`

const ArticleCardTitle = styled.div`
  color: rgb(0, 119, 204);
  line-height: 1.5;
  margin-bottom: 7px;
  transition: all 200ms linear 0s;
`

const ArticleCardContent = styled.div`

`


export default HomePanel